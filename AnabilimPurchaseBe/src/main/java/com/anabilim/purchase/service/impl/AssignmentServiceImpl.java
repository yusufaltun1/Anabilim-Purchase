package com.anabilim.purchase.service.impl;

import com.anabilim.purchase.dto.request.CreateAssignmentDto;
import com.anabilim.purchase.dto.response.AssignmentDto;
import com.anabilim.purchase.entity.*;
import com.anabilim.purchase.entity.enums.AssignmentStatus;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.mapper.AssignmentMapper;
import com.anabilim.purchase.repository.*;
import com.anabilim.purchase.service.AssignmentService;
import com.anabilim.purchase.entity.enums.MovementType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    
    @Override
    public AssignmentDto createAssignment(CreateAssignmentDto dto) {
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
            
            assignment.setStockItem(stockItem);
        }
        
        // Kullanıcı zimmeti
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
        
        // Assignment'ı kaydet
        Assignment savedAssignment = assignmentRepository.save(assignment);
        
        // Depodan çıkış kaydı oluştur
        createStockMovementForAssignment(savedAssignment);
        
        return assignmentMapper.toDto(savedAssignment);
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
        if (!assignmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Zimmet bulunamadı: " + id);
        }
        assignmentRepository.deleteById(id);
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
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Zimmet bulunamadı: " + assignmentId));
        
        if (!assignment.canBeReturned()) {
            throw new IllegalArgumentException("Bu zimmet geri kazandırılamaz");
        }
        
        assignment.markAsReturned();
        
        Assignment savedAssignment = assignmentRepository.save(assignment);
        
        // Depoya giriş kaydı oluştur
        createStockMovementForReturn(savedAssignment);
        
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
    private void createStockMovementForAssignment(Assignment assignment) {
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
            // Varsayılan depo veya belirtilen depodan çıkış
            List<WarehouseStock> warehouseStocks = warehouseStockRepository.findByProduct(product);
            
            if (!warehouseStocks.isEmpty()) {
                // İlk depodan çıkış yap (veya en çok stoku olan depodan)
                WarehouseStock warehouseStock = warehouseStocks.stream()
                        .filter(ws -> ws.getCurrentStock() >= assignment.getQuantity())
                        .findFirst()
                        .orElse(warehouseStocks.get(0));
                
                if (warehouseStock.getCurrentStock() >= assignment.getQuantity()) {
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
                }
            }
        }
    }
    
    /**
     * Zimmet geri alındığında depoya giriş kaydı oluşturur
     */
    private void createStockMovementForReturn(Assignment assignment) {
        Product product = assignment.getProduct();
        
        // Ürünün stok takip tipini kontrol et
        if (product.getStockTrackingType() == null) {
            return; // Stok takibi yapılmayan ürünler için hareket kaydı oluşturma
        }
        
        // Seri numaralı ürünler için StockItem'ı depoya geri al
        if (assignment.getStockItem() != null) {
            StockItem stockItem = assignment.getStockItem();
            
            // Varsayılan depo veya ilk depoya geri al
            List<WarehouseStock> warehouseStocks = warehouseStockRepository.findByProduct(product);
            if (!warehouseStocks.isEmpty()) {
                Warehouse warehouse = warehouseStocks.get(0).getWarehouse();
                
                // Giriş hareketi oluştur
                StockMovement movement = new StockMovement();
                movement.setWarehouseStock(warehouseStocks.get(0));
                movement.setQuantity(1); // Seri numaralı ürünler için 1 adet
                movement.setMovementType(MovementType.IN);
                movement.setReferenceType("ASSIGNMENT_RETURN");
                movement.setReferenceId(assignment.getId());
                movement.setNotes("Zimmet geri alındı - " + 
                        (assignment.getAssignedUser() != null ? 
                                "Kullanıcı: " + assignment.getAssignedUser().getFullName() :
                                "Konum: " + (assignment.getAssignedLocation() != null ? 
                                        assignment.getAssignedLocation().getName() : 
                                        assignment.getLocationName())));
                
                stockMovementRepository.save(movement);
                
                // StockItem'ı depoya geri al
                stockItem.setCurrentWarehouse(warehouse);
                stockItem.setStatus(com.anabilim.purchase.entity.enums.StockItemStatus.IN_STOCK);
                stockItemRepository.save(stockItem);
            }
        } else {
            // Miktar bazlı ürünler için WarehouseStock'a geri ekle
            List<WarehouseStock> warehouseStocks = warehouseStockRepository.findByProduct(product);
            
            if (!warehouseStocks.isEmpty()) {
                // İlk depoya geri ekle
                WarehouseStock warehouseStock = warehouseStocks.get(0);
                
                // Giriş hareketi oluştur
                StockMovement movement = new StockMovement();
                movement.setWarehouseStock(warehouseStock);
                movement.setQuantity(assignment.getQuantity());
                movement.setMovementType(MovementType.IN);
                movement.setReferenceType("ASSIGNMENT_RETURN");
                movement.setReferenceId(assignment.getId());
                movement.setNotes("Zimmet geri alındı - " + 
                        (assignment.getAssignedUser() != null ? 
                                "Kullanıcı: " + assignment.getAssignedUser().getFullName() :
                                "Konum: " + (assignment.getAssignedLocation() != null ? 
                                        assignment.getAssignedLocation().getName() : 
                                        assignment.getLocationName())));
                
                stockMovementRepository.save(movement);
            }
        }
    }
}
