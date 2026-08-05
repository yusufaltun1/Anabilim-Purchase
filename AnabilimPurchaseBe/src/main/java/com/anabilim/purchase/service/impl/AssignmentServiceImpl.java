package com.anabilim.purchase.service.impl;

import com.anabilim.purchase.dto.request.CreateAssignmentDto;
import com.anabilim.purchase.dto.response.AssignmentDto;
import com.anabilim.purchase.entity.*;
import com.anabilim.purchase.entity.enums.AssignmentStatus;
import com.anabilim.purchase.entity.enums.StockItemStatus;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.exception.ValidationException;
import com.anabilim.purchase.mapper.AssignmentMapper;
import com.anabilim.purchase.repository.*;
import com.anabilim.purchase.service.AssetConditionSupport;
import com.anabilim.purchase.service.AssignmentFormService;
import com.anabilim.purchase.service.AssignmentService;
import com.anabilim.purchase.service.CurrentUserService;
import com.anabilim.purchase.entity.enums.MovementType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AssignmentServiceImpl implements AssignmentService {
    
    private final AssignmentRepository assignmentRepository;
    private final ProductRepository productRepository;
    private final StockItemRepository stockItemRepository;
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final AssignmentMapper assignmentMapper;
    private final StockMovementRepository stockMovementRepository;
    private final WarehouseStockRepository warehouseStockRepository;
    private final WarehouseRepository warehouseRepository;
    private final AssetConditionSupport assetConditionSupport;
    private final AssignmentFormService assignmentFormService;
    private final CurrentUserService currentUserService;
    
    @Override
    public AssignmentDto createAssignment(CreateAssignmentDto dto) {
        throw new ValidationException("Zimmet için ürün fotoğrafı zorunludur.");
    }

    @Override
    public AssignmentDto createAssignment(CreateAssignmentDto dto, MultipartFile photo) {
        if (photo == null || photo.isEmpty()) {
            throw new ValidationException("Zimmet için ürün fotoğrafı zorunludur.");
        }

        // Ürün kontrolü
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Ürün bulunamadı: " + dto.getProductId()));
        
        // Assignment oluştur
        Assignment assignment = assignmentMapper.toEntity(dto);
        assignment.setProduct(product);
        
        // StockItem kontrolü (seri numaralı ürünler için)
        if (dto.getStockItemId() != null) {
            StockItem stockItem = stockItemRepository.findById(dto.getStockItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("StockItem bulunamadı: " + dto.getStockItemId()));
            
            // StockItem'ın bu ürüne ait olduğunu kontrol et
            if (!stockItem.getProduct().getId().equals(product.getId())) {
                throw new IllegalArgumentException("StockItem bu ürüne ait değil");
            }

            assetConditionSupport.validateAssignable(stockItem);
            
            assignment.setStockItem(stockItem);
        } else if (product.isSerialNumberTracked()) {
            throw new ValidationException("Seri numaralı ürünler için depodaki hazır cihaz seçilmelidir.");
        } else if (product.isQuantityReusableTracked()) {
            stockItemRepository.findFirstByProductIdAndIsActiveTrueOrderByIdAsc(product.getId())
                    .ifPresent(assetConditionSupport::validateAssignable);
        }
        
        // Kullanıcı zimmeti — konum bilgisi kullanıcının çalışma konumundan (kullanıcı kartı/grup) alınır
        if (dto.getAssignedUserId() != null) {
            User user = userRepository.findById(dto.getAssignedUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı: " + dto.getAssignedUserId()));
            assignment.setAssignedUser(user);
        }

        // Konum kontrolü
        if (dto.getAssignedLocationId() != null) {
            Location location = locationRepository.findById(dto.getAssignedLocationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Konum bulunamadı: " + dto.getAssignedLocationId()));
            assignment.setAssignedLocation(location);
        }

        // Konum zimmeti kontrolü
        if (dto.getLocationName() != null && dto.getAssignedUserId() != null) {
            throw new IllegalArgumentException("Hem kullanıcıya hem konuma zimmet yapılamaz");
        }
        
        // Geçerlilik tarihi kontrolü
        if (dto.getExpectedReturnDate() != null) {
            // Geçerlilik tarihi bugünden önce olamaz
            if (dto.getExpectedReturnDate().isBefore(LocalDate.now())) {
                throw new IllegalArgumentException("Geçerlilik tarihi bugünden önce olamaz");
            }
        }
        // Geçerlilik tarihi belirtilmezse null kalır (manuel iade gerekir)
        
        currentUserService.findCurrentUser().ifPresent(assignment::setCreatedByUser);

        // Assignment'ı kaydet
        Assignment savedAssignment = assignmentRepository.save(assignment);
        
        // Zimmet sonrası cihaz konumunu güncelle (kişi çalışma konumu veya konum zimmeti)
        applyAssignmentLocationToStockItem(savedAssignment);

        // Depodan çıkış kaydı oluştur
        createStockMovementForAssignment(savedAssignment, dto.getWarehouseId());

        assignmentFormService.uploadFormPhoto(savedAssignment.getId(), photo);
        
        return assignmentMapper.toDto(
                assignmentRepository.findById(savedAssignment.getId()).orElse(savedAssignment)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AssignmentDto getAssignmentById(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zimmet bulunamadı: " + id));
        return assignmentMapper.toDto(assignment);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDto> getAllAssignments() {
        List<Assignment> assignments = assignmentRepository.findAll();
        return assignmentMapper.toDtoList(assignments);
    }
    
    @Override
    public void deleteAssignment(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zimmet bulunamadı: " + id));

        if (!assignment.canBeCancelled()) {
            if (assignment.getSignedFormStoredPath() != null && !assignment.getSignedFormStoredPath().isBlank()) {
                throw new IllegalArgumentException("İmzalı form yüklenmiş zimmet iptal edilemez");
            }
            throw new IllegalArgumentException("Bu zimmet iptal edilemez");
        }

        revertStockForCancelledAssignment(assignment);
        clearStockItemLocationFromAssignment(assignment);
        assignmentFormService.deleteFormPhotoFiles(assignment);
        assignmentRepository.delete(assignment);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDto> getAssignmentsByProductId(Long productId) {
        List<Assignment> assignments = assignmentRepository.findByProductId(productId);
        return assignmentMapper.toDtoList(assignments);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDto> getAssignmentsByProductIdAndStatus(Long productId, AssignmentStatus status) {
        List<Assignment> assignments = assignmentRepository.findByProductIdAndStatus(productId, status);
        return assignmentMapper.toDtoList(assignments);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDto> getAssignmentsByStockItemId(Long stockItemId) {
        List<Assignment> assignments = assignmentRepository.findByStockItemId(stockItemId);
        return assignmentMapper.toDtoList(assignments);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDto> getAssignmentsByUserId(Long userId) {
        List<Assignment> assignments = assignmentRepository.findByAssignedUserId(userId);
        return assignmentMapper.toDtoList(assignments);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDto> getAssignmentsByUserIdAndStatus(Long userId, AssignmentStatus status) {
        List<Assignment> assignments = assignmentRepository.findByAssignedUserIdAndStatus(userId, status);
        return assignmentMapper.toDtoList(assignments);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDto> getActiveAssignmentsByUserId(Long userId) {
        List<Assignment> assignments = assignmentRepository.findActiveAssignmentsByUserId(userId);
        return assignmentMapper.toDtoList(assignments);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDto> getAssignmentsByLocationId(Long locationId) {
        List<Assignment> assignments = assignmentRepository.findByAssignedLocationId(locationId);
        return assignmentMapper.toDtoList(assignments);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDto> getAssignmentsByLocation(String locationName) {
        List<Assignment> assignments = assignmentRepository.findByLocationName(locationName);
        return assignmentMapper.toDtoList(assignments);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDto> getActiveAssignmentsByLocation(String locationName) {
        List<Assignment> assignments = assignmentRepository.findActiveAssignmentsByLocation(locationName);
        return assignmentMapper.toDtoList(assignments);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDto> getAssignmentsByStatus(AssignmentStatus status) {
        List<Assignment> assignments = assignmentRepository.findByStatus(status);
        return assignmentMapper.toDtoList(assignments);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDto> getActiveAssignments() {
        List<Assignment> assignments = assignmentRepository.findByStatusAndIsActiveTrue(AssignmentStatus.ACTIVE);
        return assignmentMapper.toDtoList(assignments);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDto> getExpiredAssignments() {
        List<Assignment> assignments = assignmentRepository.findExpiredAssignments(LocalDate.now());
        return assignmentMapper.toDtoList(assignments);
    }
    
    @Override
    public AssignmentDto returnAssignment(Long assignmentId) {
        return returnAssignment(assignmentId, null, null, null, null);
    }

    @Override
    public AssignmentDto returnAssignment(
            Long assignmentId,
            MultipartFile photo,
            MultipartFile document,
            String notes,
            Long warehouseId
    ) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Zimmet bulunamadı: " + assignmentId));
        
        if (!assignment.canBeReturned()) {
            throw new IllegalArgumentException("Bu zimmet geri kazandırılamaz");
        }

        if (photo != null || document != null) {
            assignmentFormService.storeReturnAttachments(assignment, photo, document);
        } else {
            throw new ValidationException("İade için ürün fotoğrafı ve belge yüklenmelidir.");
        }

        if (warehouseId == null) {
            throw new ValidationException("İade için hedef depo seçilmelidir.");
        }

        if (notes != null && !notes.isBlank()) {
            assignment.setReturnNotes(notes.trim());
            String existingNotes = assignment.getNotes();
            String returnNoteLine = "İade notu: " + notes.trim();
            assignment.setNotes(
                    existingNotes == null || existingNotes.isBlank()
                            ? returnNoteLine
                            : existingNotes + "\n" + returnNoteLine
            );
        }
        
        assignment.markAsReturned();
        currentUserService.findCurrentUser().ifPresent(assignment::setReturnedByUser);

        // İade sonrası cihaz üzerindeki zimmet kaynaklı konum bilgisi temizlenir
        clearStockItemLocationFromAssignment(assignment);
        
        Assignment savedAssignment = assignmentRepository.save(assignment);
        
        // Seçilen depoya giriş kaydı oluştur
        createStockMovementForReturn(savedAssignment, warehouseId);
        
        return assignmentMapper.toDto(savedAssignment);
    }

    @Override
    public AssignmentDto markAssignmentAsLost(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Zimmet bulunamadı: " + assignmentId));
        
        assignment.markAsLost();
        
        Assignment savedAssignment = assignmentRepository.save(assignment);
        return assignmentMapper.toDto(savedAssignment);
    }
    
    @Override
    public AssignmentDto markAssignmentAsDamaged(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Zimmet bulunamadı: " + assignmentId));
        
        assignment.markAsDamaged();
        
        Assignment savedAssignment = assignmentRepository.save(assignment);
        return assignmentMapper.toDto(savedAssignment);
    }
    
    @Override
    public AssignmentDto transferAssignmentToUser(Long assignmentId, Long newUserId, Long newLocationId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Zimmet bulunamadı: " + assignmentId));
        
        User newUser = userRepository.findById(newUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı: " + newUserId));
        
        Location newLocation = null;
        if (newLocationId != null) {
            newLocation = locationRepository.findById(newLocationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Konum bulunamadı: " + newLocationId));
        }
        
        assignment.transferToUser(newUser, newLocation);
        
        Assignment savedAssignment = assignmentRepository.save(assignment);
        applyAssignmentLocationToStockItem(savedAssignment);
        return assignmentMapper.toDto(savedAssignment);
    }
    
    @Override
    public AssignmentDto transferAssignmentToLocation(Long assignmentId, String newLocationName, String newLocationDetails) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Zimmet bulunamadı: " + assignmentId));
        
        assignment.transferToLocation(newLocationName, newLocationDetails);
        
        Assignment savedAssignment = assignmentRepository.save(assignment);
        return assignmentMapper.toDto(savedAssignment);
    }
    
    @Override
    @Transactional(readOnly = true)
    public long countAssignmentsByProductId(Long productId) {
        return assignmentRepository.countByProductId(productId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public long countAssignmentsByProductIdAndStatus(Long productId, AssignmentStatus status) {
        return assignmentRepository.countByProductIdAndStatus(productId, status);
    }
    
    @Override
    @Transactional(readOnly = true)
    public long countAssignmentsByUserId(Long userId) {
        return assignmentRepository.countByAssignedUserId(userId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public long countAssignmentsByUserIdAndStatus(Long userId, AssignmentStatus status) {
        return assignmentRepository.countByAssignedUserIdAndStatus(userId, status);
    }
    
    @Override
    @Transactional(readOnly = true)
    public long countAssignmentsByLocationId(Long locationId) {
        return assignmentRepository.countByAssignedLocationId(locationId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public long countAssignmentsByLocation(String locationName) {
        return assignmentRepository.countByLocationName(locationName);
    }
    
    @Override
    @Transactional(readOnly = true)
    public long countAssignmentsByStatus(AssignmentStatus status) {
        return assignmentRepository.countByStatus(status);
    }
    
    @Override
    @Transactional(readOnly = true)
    public long countActiveAssignments() {
        return assignmentRepository.countActiveAssignments();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AssignmentDto> getActiveAssignmentsOnly() {
        List<Assignment> assignments = assignmentRepository.findByIsActiveTrue();
        return assignmentMapper.toDtoList(assignments);
    }
    
    @Override
    public AssignmentDto activateAssignment(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Zimmet bulunamadı: " + assignmentId));
        
        assignment.setActive(true);
        
        Assignment savedAssignment = assignmentRepository.save(assignment);
        return assignmentMapper.toDto(savedAssignment);
    }
    
    @Override
    public AssignmentDto deactivateAssignment(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Zimmet bulunamadı: " + assignmentId));
        
        assignment.setActive(false);
        
        Assignment savedAssignment = assignmentRepository.save(assignment);
        return assignmentMapper.toDto(savedAssignment);
    }
    
    /**
     * Zimmet yapıldığında depodan çıkış kaydı oluşturur
     */
    private void createStockMovementForAssignment(Assignment assignment, Long preferredWarehouseId) {
        Product product = assignment.getProduct();

        // Ürünün stok takip tipini kontrol et
        if (product.getStockTrackingType() == null) {
            return; // Stok takibi yapılmayan ürünler için hareket kaydı oluşturma
        }

        // Seri numaralı ürünler için StockItem'dan warehouse bilgisini al
        if (assignment.getStockItem() != null) {
            StockItem stockItem = assignment.getStockItem();
            if (stockItem.getCurrentWarehouse() != null) {
                // WarehouseStock kaydını bul
                WarehouseStock warehouseStock = warehouseStockRepository
                        .findByWarehouseAndProduct(stockItem.getCurrentWarehouse(), product)
                        .orElse(null);
                
                if (warehouseStock != null) {
                    // Çıkış hareketi oluştur
                    StockMovement movement = new StockMovement();
                    movement.setWarehouseStock(warehouseStock);
                    movement.setStockItem(stockItem);
                    movement.setQuantity(1); // Seri numaralı ürünler için 1 adet
                    movement.setMovementType(MovementType.OUT);
                    movement.setReferenceType("ASSIGNMENT");
                    movement.setReferenceId(assignment.getId());
                    movement.setNotes("Zimmet çıkışı - " + 
                            (assignment.getAssignedUser() != null ? 
                                    "Kullanıcı: " + assignment.getAssignedUser().getFullName() :
                                    "Konum: " + (assignment.getAssignedLocation() != null ? 
                                            assignment.getAssignedLocation().getName() : 
                                            assignment.getLocationName())));
                    
                    stockMovementRepository.save(movement);
                    
                    // StockItem'ı depodan çıkar
                    stockItem.setCurrentWarehouse(null);
                    stockItem.setStatus(com.anabilim.purchase.entity.enums.StockItemStatus.ASSIGNED);
                    stockItemRepository.save(stockItem);
                }
            }
        } else {
            // Miktar bazlı ürünler için WarehouseStock'tan çıkış yap
            WarehouseStock warehouseStock = null;
            if (preferredWarehouseId != null) {
                Warehouse warehouse = warehouseRepository.findById(preferredWarehouseId)
                        .orElseThrow(() -> new ResourceNotFoundException("Depo bulunamadı: " + preferredWarehouseId));
                warehouseStock = warehouseStockRepository.findByWarehouseAndProduct(warehouse, product)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Ürün bu depoda stok kaydına sahip değil: depo=" + preferredWarehouseId));
            } else {
                List<WarehouseStock> warehouseStocks = warehouseStockRepository.findByProduct(product);
                if (!warehouseStocks.isEmpty()) {
                    warehouseStock = warehouseStocks.stream()
                            .filter(ws -> ws.getCurrentStock() >= assignment.getQuantity())
                            .findFirst()
                            .orElse(warehouseStocks.get(0));
                }
            }

            if (warehouseStock != null && warehouseStock.getCurrentStock() >= assignment.getQuantity()) {
                    // Çıkış hareketi oluştur
                    StockMovement movement = new StockMovement();
                    movement.setWarehouseStock(warehouseStock);
                    movement.setQuantity(assignment.getQuantity());
                    movement.setMovementType(MovementType.OUT);
                    movement.setReferenceType("ASSIGNMENT");
                    movement.setReferenceId(assignment.getId());
                    movement.setNotes("Zimmet çıkışı - " + 
                            (assignment.getAssignedUser() != null ? 
                                    "Kullanıcı: " + assignment.getAssignedUser().getFullName() :
                                    "Konum: " + (assignment.getAssignedLocation() != null ? 
                                            assignment.getAssignedLocation().getName() : 
                                            assignment.getLocationName())));
                    
                    stockMovementRepository.save(movement);
            } else if (warehouseStock != null) {
                throw new ValidationException(
                        "Depoda yeterli stok yok. Mevcut: " + warehouseStock.getCurrentStock()
                                + ", istenen: " + assignment.getQuantity());
            }
        }
    }

    /**
     * Zimmet geri alındığında depoya giriş kaydı oluşturur (otomatik depo çözümleme)
     */
    private void createStockMovementForReturn(Assignment assignment) {
        createStockMovementForReturn(assignment, null, "ASSIGNMENT_RETURN", "Zimmet geri alındı - ");
    }

    private void createStockMovementForReturn(Assignment assignment, Long warehouseId) {
        createStockMovementForReturn(assignment, warehouseId, "ASSIGNMENT_RETURN", "Zimmet geri alındı - ");
    }

    private void revertStockForCancelledAssignment(Assignment assignment) {
        Product product = assignment.getProduct();
        if (product.getStockTrackingType() == null) {
            return;
        }

        List<StockMovement> assignmentMovements = stockMovementRepository
                .findByReferenceTypeAndReferenceIdOrderByCreatedAtDesc("ASSIGNMENT", assignment.getId());

        WarehouseStock warehouseStock = assignmentMovements.stream()
                .findFirst()
                .map(StockMovement::getWarehouseStock)
                .orElse(null);

        if (!assignmentMovements.isEmpty()) {
            stockMovementRepository.deleteAll(assignmentMovements);
        }

        // Önceki iptal denemelerinden kalmış telafi hareketlerini de temizle
        List<StockMovement> cancelMovements = stockMovementRepository
                .findByReferenceTypeAndReferenceIdOrderByCreatedAtDesc("ASSIGNMENT_CANCEL", assignment.getId());
        if (!cancelMovements.isEmpty()) {
            stockMovementRepository.deleteAll(cancelMovements);
        }

        if (assignment.getStockItem() != null) {
            StockItem stockItem = assignment.getStockItem();
            if (warehouseStock != null) {
                stockItem.setCurrentWarehouse(warehouseStock.getWarehouse());
            } else {
                warehouseStockRepository.findByProduct(product).stream()
                        .findFirst()
                        .ifPresent(ws -> stockItem.setCurrentWarehouse(ws.getWarehouse()));
            }
            stockItem.setStatus(StockItemStatus.IN_STOCK);
            stockItemRepository.save(stockItem);
        }
    }

    private void createStockMovementForReturn(
            Assignment assignment,
            Long warehouseId,
            String referenceType,
            String notePrefix
    ) {
        Product product = assignment.getProduct();

        if (product.getStockTrackingType() == null) {
            return;
        }

        WarehouseStock targetWarehouseStock = resolveWarehouseStockForReturn(assignment, warehouseId);
        if (targetWarehouseStock == null) {
            return;
        }
        restoreStockAfterAssignment(assignment, targetWarehouseStock, referenceType, notePrefix);
    }

    private void restoreStockAfterAssignment(
            Assignment assignment,
            WarehouseStock warehouseStock,
            String referenceType,
            String notePrefix
    ) {
        StockMovement movement = new StockMovement();
        movement.setWarehouseStock(warehouseStock);
        movement.setStockItem(assignment.getStockItem());
        movement.setQuantity(assignment.getStockItem() != null ? 1 : assignment.getQuantity());
        movement.setMovementType(MovementType.IN);
        movement.setReferenceType(referenceType);
        movement.setReferenceId(assignment.getId());
        movement.setNotes(notePrefix + assignmentTargetNote(assignment));
        warehouseStock.addMovement(movement);
        warehouseStockRepository.save(warehouseStock);

        if (assignment.getStockItem() != null) {
            StockItem stockItem = assignment.getStockItem();
            stockItem.setCurrentWarehouse(warehouseStock.getWarehouse());
            stockItem.setStatus(StockItemStatus.IN_STOCK);
            stockItemRepository.save(stockItem);
        }
    }

    private WarehouseStock resolveWarehouseStockForReturn(Assignment assignment, Long warehouseId) {
        Product product = assignment.getProduct();

        if (warehouseId != null) {
            Warehouse warehouse = warehouseRepository.findById(warehouseId)
                    .orElseThrow(() -> new ResourceNotFoundException("Depo bulunamadı: " + warehouseId));
            return findOrCreateWarehouseStock(warehouse, product);
        }

        List<StockMovement> assignmentMovements = stockMovementRepository
                .findByReferenceTypeAndReferenceIdOrderByCreatedAtDesc("ASSIGNMENT", assignment.getId());

        for (StockMovement movement : assignmentMovements) {
            WarehouseStock warehouseStock = movement.getWarehouseStock();
            if (warehouseStock != null) {
                return warehouseStockRepository.findByWarehouseAndProduct(
                        warehouseStock.getWarehouse(),
                        product
                ).orElse(warehouseStock);
            }
        }

        List<WarehouseStock> warehouseStocks = warehouseStockRepository.findByProduct(product);
        if (!warehouseStocks.isEmpty()) {
            return warehouseStocks.get(0);
        }
        return null;
    }

    private WarehouseStock findOrCreateWarehouseStock(Warehouse warehouse, Product product) {
        return warehouseStockRepository.findByWarehouseAndProduct(warehouse, product)
                .orElseGet(() -> {
                    WarehouseStock created = new WarehouseStock();
                    created.setWarehouse(warehouse);
                    created.setProduct(product);
                    return warehouseStockRepository.save(created);
                });
    }

    private String assignmentTargetNote(Assignment assignment) {
        if (assignment.getAssignedUser() != null) {
            return "Kullanıcı: " + assignment.getAssignedUser().getFullName();
        }
        if (assignment.getAssignedLocation() != null) {
            return "Konum: " + assignment.getAssignedLocation().getName();
        }
        return "Konum: " + assignment.getLocationName();
    }

    /**
     * Zimmet sonrası cihazın liste konum alanlarını günceller:
     * - Kişi zimmeti → kullanıcının çalışma konumu (ve okulu)
     * - Konum zimmeti → zimmetlenen konum hiyerarşisi
     */
    private void applyAssignmentLocationToStockItem(Assignment assignment) {
        if (assignment.getStockItem() == null) {
            return;
        }

        StockItem stockItem = assignment.getStockItem();

        if (assignment.isUserAssignment()) {
            User user = assignment.getAssignedUser();
            if (user == null) {
                return;
            }
            stockItem.setDefaultParentLocation(user.getWorkLocationParent());
            stockItem.setDefaultChildLocation(user.getWorkLocationChild());
            if (user.getSchool() != null) {
                stockItem.setSchool(user.getSchool());
            }
            stockItemRepository.save(stockItem);
            return;
        }

        if (!assignment.isLocationAssignment()) {
            return;
        }

        Location assignedLocation = assignment.getAssignedLocation();
        if (assignedLocation == null) {
            return;
        }

        Location root = assignedLocation;
        while (root.getParent() != null) {
            root = root.getParent();
        }

        if (assignedLocation.getParent() == null) {
            stockItem.setDefaultParentLocation(assignedLocation);
            stockItem.setDefaultChildLocation(null);
        } else {
            stockItem.setDefaultParentLocation(root);
            stockItem.setDefaultChildLocation(assignedLocation);
        }
        stockItemRepository.save(stockItem);
    }

    /** Zimmet iade/iptalinde cihaz üzerindeki zimmet kaynaklı konum bilgisini temizler. */
    private void clearStockItemLocationFromAssignment(Assignment assignment) {
        if (assignment.getStockItem() == null) {
            return;
        }
        if (!assignment.isUserAssignment() && !assignment.isLocationAssignment()) {
            return;
        }
        StockItem stockItem = assignment.getStockItem();
        stockItem.setDefaultParentLocation(null);
        stockItem.setDefaultChildLocation(null);
        stockItemRepository.save(stockItem);
    }
    
    @Override
    @Transactional
    public void autoCloseExpiredAssignments() {
        // Süresi dolmuş aktif zimmetleri bul
        List<Assignment> expiredAssignments = assignmentRepository.findAll().stream()
                .filter(Assignment::isExpired)
                .collect(java.util.stream.Collectors.toList());
        
        for (Assignment assignment : expiredAssignments) {
            // Otomatik kapat
            assignment.autoCloseIfExpired();
            assignmentRepository.save(assignment);
            
            // Depoya geri kazandır (sadece geri kazandırılabilir ürünler için)
            if (assignment.getProduct().isReusable()) {
                createStockMovementForReturn(assignment);
            }
        }
    }
}
