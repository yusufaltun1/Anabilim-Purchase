package com.anabilim.purchase.service;

import com.anabilim.purchase.dto.response.AssignmentFormPhotoDto;
import com.anabilim.purchase.dto.response.AttachmentDownloadResult;
import com.anabilim.purchase.dto.response.AssignmentSignedFormDto;
import com.anabilim.purchase.entity.Assignment;
import com.anabilim.purchase.entity.DeviceModel;
import com.anabilim.purchase.entity.Location;
import com.anabilim.purchase.entity.Product;
import com.anabilim.purchase.entity.StockItem;
import com.anabilim.purchase.entity.User;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.exception.ValidationException;
import com.anabilim.purchase.repository.AssignmentRepository;
import com.anabilim.purchase.repository.UserRepository;
import com.anabilim.purchase.util.LocationSupport;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.ClientAnchor;
import org.apache.poi.ss.usermodel.Drawing;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellReference;
import org.apache.poi.util.IOUtils;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssignmentFormService {

    private static final String TEMPLATE_PATH = "Zimmet_Formu.xlsx";
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final long MAX_FILE_SIZE = 20L * 1024 * 1024;

    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    @Transactional(readOnly = true)
    public AttachmentDownloadResult downloadFilledForm(Long assignmentId) {
        Assignment assignment = loadAssignmentWithDetails(assignmentId);
        byte[] content = generateFilledForm(assignment);
        String fileName = buildFormFileName(assignment);
        Resource resource = new org.springframework.core.io.ByteArrayResource(content) {
            @Override
            public String getFilename() {
                return fileName;
            }
        };
        return new AttachmentDownloadResult(
                resource,
                fileName,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
    }

    @Transactional(readOnly = true)
    public AttachmentDownloadResult downloadReturnFilledForm(Long assignmentId) {
        Assignment assignment = loadAssignmentWithDetails(assignmentId);
        if (!assignment.canBeReturned()) {
            throw new ValidationException("Bu zimmet için iade formu oluşturulamaz.");
        }
        byte[] content = generateReturnFilledForm(assignment);
        String fileName = buildReturnFormFileName(assignment);
        Resource resource = new org.springframework.core.io.ByteArrayResource(content) {
            @Override
            public String getFilename() {
                return fileName;
            }
        };
        return new AttachmentDownloadResult(
                resource,
                fileName,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
    }

    @Transactional
    public AssignmentFormPhotoDto uploadFormPhoto(Long assignmentId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("Dosya boş olamaz.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ValidationException("Dosya boyutu 20 MB'dan büyük olamaz.");
        }
        String contentType = file.getContentType();
        if (!isAllowedImageType(contentType, file.getOriginalFilename())) {
            throw new ValidationException("Sadece JPEG veya PNG resim dosyası yüklenebilir.");
        }

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Zimmet bulunamadı: " + assignmentId));

        deleteStoredFile(assignment.getFormPhotoStoredPath());

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            originalFilename = "zimmet-foto";
        }
        String ext = "";
        int dot = originalFilename.lastIndexOf('.');
        if (dot > 0) {
            ext = originalFilename.substring(dot);
        }
        String storedName = UUID.randomUUID() + ext;
        Path dir = getUploadBasePath().resolve("assignments").resolve(assignmentId.toString()).resolve("photos");
        try {
            Files.createDirectories(dir);
            Path target = dir.resolve(storedName);
            file.transferTo(target.toFile());
        } catch (IOException e) {
            throw new ValidationException("Dosya kaydedilemedi: " + e.getMessage());
        }

        assignment.setFormPhotoFileName(originalFilename);
        assignment.setFormPhotoContentType(contentType != null ? contentType : "application/octet-stream");
        assignment.setFormPhotoStoredPath("assignments/" + assignmentId + "/photos/" + storedName);
        assignmentRepository.save(assignment);

        return toFormPhotoDto(assignment);
    }

    @Transactional(readOnly = true)
    public AttachmentDownloadResult downloadFormPhoto(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Zimmet bulunamadı: " + assignmentId));
        if (assignment.getFormPhotoStoredPath() == null || assignment.getFormPhotoStoredPath().isBlank()) {
            throw new ResourceNotFoundException("Bu zimmet için ürün fotoğrafı bulunamadı.");
        }
        Path path = getUploadBasePath().resolve(assignment.getFormPhotoStoredPath());
        if (!Files.exists(path)) {
            throw new ResourceNotFoundException("Ürün fotoğrafı dosyası bulunamadı.");
        }
        Resource resource = new FileSystemResource(path.toFile());
        return new AttachmentDownloadResult(
                resource,
                assignment.getFormPhotoFileName() != null ? assignment.getFormPhotoFileName() : "zimmet-foto",
                assignment.getFormPhotoContentType()
        );
    }

    public void deleteFormPhotoFiles(Assignment assignment) {
        deleteStoredFile(assignment.getFormPhotoStoredPath());
        deleteStoredFile(assignment.getReturnPhotoStoredPath());
        deleteStoredFile(assignment.getReturnDocumentStoredPath());
        deleteStoredFile(assignment.getSignedFormStoredPath());
    }

    @Transactional
    public void storeReturnAttachments(Assignment assignment, MultipartFile photo, MultipartFile document) {
        if (photo == null || photo.isEmpty()) {
            throw new ValidationException("İade için ürün fotoğrafı zorunludur.");
        }
        if (document == null || document.isEmpty()) {
            throw new ValidationException("İade için dosya yükleme zorunludur.");
        }
        if (photo.getSize() > MAX_FILE_SIZE || document.getSize() > MAX_FILE_SIZE) {
            throw new ValidationException("Dosya boyutu 20 MB'dan büyük olamaz.");
        }
        if (!isAllowedImageType(photo.getContentType(), photo.getOriginalFilename())) {
            throw new ValidationException("İade fotoğrafı sadece JPEG veya PNG olabilir.");
        }
        if (!isAllowedSignedFormType(document.getContentType(), document.getOriginalFilename())) {
            throw new ValidationException("İade dosyası Excel (.xlsx), PDF veya resim olmalıdır.");
        }

        deleteStoredFile(assignment.getReturnPhotoStoredPath());
        deleteStoredFile(assignment.getReturnDocumentStoredPath());

        String photoStored = storeMultipart(
                photo,
                assignment.getId(),
                "return-photos",
                "iade-foto"
        );
        assignment.setReturnPhotoFileName(
                photo.getOriginalFilename() != null && !photo.getOriginalFilename().isBlank()
                        ? photo.getOriginalFilename()
                        : "iade-foto"
        );
        assignment.setReturnPhotoContentType(
                photo.getContentType() != null ? photo.getContentType() : "application/octet-stream"
        );
        assignment.setReturnPhotoStoredPath(photoStored);

        String documentStored = storeMultipart(
                document,
                assignment.getId(),
                "return-documents",
                "iade-belge"
        );
        assignment.setReturnDocumentFileName(
                document.getOriginalFilename() != null && !document.getOriginalFilename().isBlank()
                        ? document.getOriginalFilename()
                        : "iade-belge"
        );
        assignment.setReturnDocumentContentType(
                document.getContentType() != null ? document.getContentType() : "application/octet-stream"
        );
        assignment.setReturnDocumentStoredPath(documentStored);
    }

    @Transactional(readOnly = true)
    public AttachmentDownloadResult downloadReturnPhoto(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Zimmet bulunamadı: " + assignmentId));
        if (assignment.getReturnPhotoStoredPath() == null || assignment.getReturnPhotoStoredPath().isBlank()) {
            throw new ResourceNotFoundException("Bu zimmet için iade fotoğrafı bulunamadı.");
        }
        Path path = getUploadBasePath().resolve(assignment.getReturnPhotoStoredPath());
        if (!Files.exists(path)) {
            throw new ResourceNotFoundException("İade fotoğrafı dosyası bulunamadı.");
        }
        Resource resource = new FileSystemResource(path.toFile());
        return new AttachmentDownloadResult(
                resource,
                assignment.getReturnPhotoFileName() != null ? assignment.getReturnPhotoFileName() : "iade-foto",
                assignment.getReturnPhotoContentType()
        );
    }

    @Transactional(readOnly = true)
    public AttachmentDownloadResult downloadReturnDocument(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Zimmet bulunamadı: " + assignmentId));
        if (assignment.getReturnDocumentStoredPath() == null || assignment.getReturnDocumentStoredPath().isBlank()) {
            throw new ResourceNotFoundException("Bu zimmet için iade belgesi bulunamadı.");
        }
        Path path = getUploadBasePath().resolve(assignment.getReturnDocumentStoredPath());
        if (!Files.exists(path)) {
            throw new ResourceNotFoundException("İade belgesi dosyası bulunamadı.");
        }
        Resource resource = new FileSystemResource(path.toFile());
        return new AttachmentDownloadResult(
                resource,
                assignment.getReturnDocumentFileName() != null ? assignment.getReturnDocumentFileName() : "iade-belge",
                assignment.getReturnDocumentContentType()
        );
    }

    private String storeMultipart(MultipartFile file, Long assignmentId, String subDir, String fallbackName) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            originalFilename = fallbackName;
        }
        String ext = "";
        int dot = originalFilename.lastIndexOf('.');
        if (dot > 0) {
            ext = originalFilename.substring(dot);
        }
        String storedName = UUID.randomUUID() + ext;
        Path dir = getUploadBasePath().resolve("assignments").resolve(assignmentId.toString()).resolve(subDir);
        try {
            Files.createDirectories(dir);
            Path target = dir.resolve(storedName);
            file.transferTo(target.toFile());
        } catch (IOException e) {
            throw new ValidationException("Dosya kaydedilemedi: " + e.getMessage());
        }
        return "assignments/" + assignmentId + "/" + subDir + "/" + storedName;
    }

    @Transactional
    public AssignmentSignedFormDto uploadSignedForm(Long assignmentId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("Dosya boş olamaz.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ValidationException("Dosya boyutu 20 MB'dan büyük olamaz.");
        }
        String contentType = file.getContentType();
        if (!isAllowedSignedFormType(contentType, file.getOriginalFilename())) {
            throw new ValidationException("Sadece Excel (.xlsx), PDF veya resim dosyası yüklenebilir.");
        }

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Zimmet bulunamadı: " + assignmentId));

        deleteStoredFile(assignment.getSignedFormStoredPath());

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            originalFilename = "zimmet-formu";
        }
        String ext = "";
        int dot = originalFilename.lastIndexOf('.');
        if (dot > 0) {
            ext = originalFilename.substring(dot);
        }
        String storedName = UUID.randomUUID() + ext;
        Path dir = getUploadBasePath().resolve("assignments").resolve(assignmentId.toString());
        try {
            Files.createDirectories(dir);
            Path target = dir.resolve(storedName);
            file.transferTo(target.toFile());
        } catch (IOException e) {
            throw new ValidationException("Dosya kaydedilemedi: " + e.getMessage());
        }

        assignment.setSignedFormFileName(originalFilename);
        assignment.setSignedFormContentType(contentType != null ? contentType : "application/octet-stream");
        assignment.setSignedFormStoredPath("assignments/" + assignmentId + "/" + storedName);
        assignment.setSignedFormUploadedAt(java.time.LocalDateTime.now());
        assignmentRepository.save(assignment);

        return toSignedFormDto(assignment);
    }

    @Transactional(readOnly = true)
    public AttachmentDownloadResult downloadSignedForm(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Zimmet bulunamadı: " + assignmentId));
        if (assignment.getSignedFormStoredPath() == null || assignment.getSignedFormStoredPath().isBlank()) {
            throw new ResourceNotFoundException("Bu zimmet için imzalı form bulunamadı.");
        }
        Path path = getUploadBasePath().resolve(assignment.getSignedFormStoredPath());
        if (!Files.exists(path)) {
            throw new ResourceNotFoundException("İmzalı form dosyası bulunamadı.");
        }
        Resource resource = new FileSystemResource(path.toFile());
        return new AttachmentDownloadResult(
                resource,
                assignment.getSignedFormFileName() != null ? assignment.getSignedFormFileName() : "zimmet-formu",
                assignment.getSignedFormContentType()
        );
    }

    private Assignment loadAssignmentWithDetails(Long assignmentId) {
        return assignmentRepository.findByIdWithDetails(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Zimmet bulunamadı: " + assignmentId));
    }

    private byte[] generateFilledForm(Assignment assignment) {
        try (InputStream template = new ClassPathResource(TEMPLATE_PATH).getInputStream();
             XSSFWorkbook workbook = new XSSFWorkbook(template);
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.getSheetAt(0);
            fillForm(sheet, assignment);
            insertProductPhoto((XSSFSheet) sheet, assignment);
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new ValidationException("Zimmet formu oluşturulamadı: " + e.getMessage());
        }
    }

    private byte[] generateReturnFilledForm(Assignment assignment) {
        try (InputStream template = new ClassPathResource(TEMPLATE_PATH).getInputStream();
             XSSFWorkbook workbook = new XSSFWorkbook(template);
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.getSheetAt(0);
            fillReturnForm(sheet, assignment);
            insertProductPhoto((XSSFSheet) sheet, assignment);
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new ValidationException("İade formu oluşturulamadı: " + e.getMessage());
        }
    }

    private void fillForm(Sheet sheet, Assignment assignment) {
        User assignedUser = assignment.getAssignedUser();
        Product product = assignment.getProduct();
        StockItem stockItem = assignment.getStockItem();
        String formDate = formatFormDate(assignment.getAssignmentDate());
        User deliveringUser = resolveCurrentUser();

        // Şablon: C3=Şirket/Okul, C4=Personel Ad Soyad, F5=Çalışma Lokasyonu
        setCellValue(sheet, "C3", resolveCompanyOrSchool(assignment));
        setCellValue(sheet, "C4", resolvePersonnelName(assignment));
        setCellValue(sheet, "C5", formDate);
        setCellValue(sheet, "F3", assignedUser != null ? sanitizePlaceholder(assignedUser.getDepartment()) : "");
        setCellValue(sheet, "F4", assignedUser != null ? sanitizePlaceholder(assignedUser.getPosition()) : "");
        setCellValue(sheet, "F5", resolveWorkLocationLabel(assignment));

        if (product != null) {
            setCellValue(sheet, "B8", nullToEmpty(product.getName()));
        }
        setCellValue(sheet, "C8", resolveModelName(stockItem, product));
        setCellValue(sheet, "D8", resolveSerialNumber(stockItem));
        setCellValue(sheet, "E8", resolveDescription(assignment, stockItem, product));

        setCellValue(sheet, "A17", formatDeliveryParty(deliveringUser, formDate));
        setCellValue(sheet, "D17", formatDeliveryPartyName(resolveSignaturePartyName(assignment), formDate));
    }

    private void fillReturnForm(Sheet sheet, Assignment assignment) {
        User assignedUser = assignment.getAssignedUser();
        Product product = assignment.getProduct();
        StockItem stockItem = assignment.getStockItem();
        String returnDate = formatFormDate(LocalDateTime.now());
        User receivingUser = resolveCurrentUser();

        setCellValue(sheet, "A1", "ZİMMET İADE FORMU");
        // Şablon: C3=Şirket/Okul, C4=Personel Ad Soyad (asla lokasyon yazılmaz), F5=Çalışma Lokasyonu
        setCellValue(sheet, "C3", resolveCompanyOrSchool(assignment));
        setCellValue(sheet, "C4", resolvePersonnelName(assignment));
        setCellValue(sheet, "C5", returnDate);
        setCellValue(sheet, "F3", assignedUser != null ? sanitizePlaceholder(assignedUser.getDepartment()) : "");
        setCellValue(sheet, "F4", assignedUser != null ? sanitizePlaceholder(assignedUser.getPosition()) : "");
        setCellValue(sheet, "F5", resolveWorkLocationLabel(assignment));

        if (product != null) {
            setCellValue(sheet, "B8", nullToEmpty(product.getName()));
        }
        setCellValue(sheet, "C8", resolveModelName(stockItem, product));
        setCellValue(sheet, "D8", resolveSerialNumber(stockItem));
        setCellValue(sheet, "E8", "İADE — " + resolveDescription(assignment, stockItem, product));

        // İade: teslim eden = zimmet sahibi personel (veya konum etiketi), teslim alan = depoyu alan kullanıcı
        setCellValue(sheet, "A17", formatDeliveryPartyName(resolveSignaturePartyName(assignment), returnDate));
        setCellValue(sheet, "D17", formatDeliveryParty(receivingUser, returnDate));
    }

    private void insertProductPhoto(XSSFSheet sheet, Assignment assignment) {
        byte[] imageBytes = loadFormPhotoBytes(assignment);
        if (imageBytes == null || imageBytes.length == 0) {
            return;
        }

        int pictureType = resolvePictureType(assignment.getFormPhotoContentType(), assignment.getFormPhotoFileName());
        int pictureIdx = sheet.getWorkbook().addPicture(imageBytes, pictureType);

        Drawing<?> drawing = sheet.getDrawingPatriarch();
        if (drawing == null) {
            drawing = sheet.createDrawingPatriarch();
        }

        ClientAnchor anchor = sheet.getWorkbook().getCreationHelper().createClientAnchor();
        CellReference reference = new CellReference("F8");
        int col = reference.getCol();
        int row = reference.getRow();
        anchor.setCol1(col);
        anchor.setRow1(row);
        anchor.setCol2(col + 1);
        anchor.setRow2(row + 1);
        anchor.setDx1(0);
        anchor.setDy1(0);
        anchor.setDx2(0);
        anchor.setDy2(0);
        anchor.setAnchorType(ClientAnchor.AnchorType.MOVE_AND_RESIZE);

        drawing.createPicture(anchor, pictureIdx);
    }

    private byte[] loadFormPhotoBytes(Assignment assignment) {
        if (assignment.getFormPhotoStoredPath() == null || assignment.getFormPhotoStoredPath().isBlank()) {
            return null;
        }
        Path path = getUploadBasePath().resolve(assignment.getFormPhotoStoredPath());
        if (!Files.exists(path)) {
            return null;
        }
        try (InputStream in = Files.newInputStream(path)) {
            return IOUtils.toByteArray(in);
        } catch (IOException e) {
            return null;
        }
    }

    private int resolvePictureType(String contentType, String fileName) {
        String lowerType = contentType != null ? contentType.toLowerCase() : "";
        if (lowerType.contains("png") || (fileName != null && fileName.toLowerCase().endsWith(".png"))) {
            return Workbook.PICTURE_TYPE_PNG;
        }
        return Workbook.PICTURE_TYPE_JPEG;
    }

    private boolean isAllowedImageType(String contentType, String filename) {
        if (filename != null) {
            String lower = filename.toLowerCase();
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png")) {
                return true;
            }
        }
        if (contentType != null) {
            String lower = contentType.toLowerCase();
            return lower.contains("jpeg") || lower.contains("jpg") || lower.contains("png");
        }
        return false;
    }

    private AssignmentFormPhotoDto toFormPhotoDto(Assignment assignment) {
        AssignmentFormPhotoDto dto = new AssignmentFormPhotoDto();
        dto.setUploaded(true);
        dto.setFileName(assignment.getFormPhotoFileName());
        dto.setContentType(assignment.getFormPhotoContentType());
        dto.setPhotoUrl("/api/v1/assignments/" + assignment.getId() + "/form/photo");
        return dto;
    }

    private String resolveFirstLevelLocation(User user) {
        if (user == null) {
            return "";
        }
        if (user.getWorkLocationParent() != null && user.getWorkLocationParent().getName() != null) {
            return user.getWorkLocationParent().getName().trim();
        }
        if (user.getWorkLocationChild() != null && user.getWorkLocationChild().getParent() != null
                && user.getWorkLocationChild().getParent().getName() != null) {
            return user.getWorkLocationChild().getParent().getName().trim();
        }
        if (user.getSchool() != null && user.getSchool().getName() != null) {
            return user.getSchool().getName().trim();
        }
        return sanitizePlaceholder(user.getWorkLocation());
    }

    private String resolveSecondLevelLocation(User user) {
        if (user == null) {
            return "";
        }
        if (user.getWorkLocationChild() != null && user.getWorkLocationChild().getName() != null) {
            return user.getWorkLocationChild().getName().trim();
        }
        return "";
    }

    /** Excel C3 — Şirket/Okul Adı (lokasyon zimmetinde üst konum). */
    private String resolveCompanyOrSchool(Assignment assignment) {
        User user = assignment.getAssignedUser();
        if (user != null) {
            String fromUser = resolveFirstLevelLocation(user);
            if (!fromUser.isBlank()) {
                return fromUser;
            }
        }
        Location assignedLocation = assignment.getAssignedLocation();
        if (assignedLocation != null) {
            Location root = assignedLocation;
            while (root.getParent() != null) {
                root = root.getParent();
            }
            if (root.getName() != null && !root.getName().isBlank()) {
                return root.getName().trim();
            }
        }
        return "";
    }

    /** Excel C4 — yalnızca personel adı; konum zimmetinde boş bırakılır. */
    private String resolvePersonnelName(Assignment assignment) {
        User user = assignment.getAssignedUser();
        if (user == null) {
            return "";
        }
        return resolveUserDisplayName(user);
    }

    /** Excel F5 — Çalışma Lokasyonu (kişi veya zimmetlenen konum). */
    private String resolveWorkLocationLabel(Assignment assignment) {
        User user = assignment.getAssignedUser();
        if (user != null) {
            String userLocation = resolveSecondLevelLocation(user);
            if (!userLocation.isBlank()) {
                return userLocation;
            }
            return sanitizePlaceholder(user.getWorkLocation());
        }
        Location assignedLocation = assignment.getAssignedLocation();
        if (assignedLocation != null) {
            String path = LocationSupport.path(assignedLocation);
            if (path != null && !path.isBlank()) {
                return path;
            }
            if (assignedLocation.getName() != null) {
                return assignedLocation.getName().trim();
            }
        }
        if (assignment.getLocationDetails() != null && !assignment.getLocationDetails().isBlank()) {
            return assignment.getLocationDetails().trim();
        }
        return nullToEmpty(assignment.getLocationName());
    }

    /** İmza satırı için taraf adı: personel veya konum etiketi. */
    private String resolveSignaturePartyName(Assignment assignment) {
        String personnel = resolvePersonnelName(assignment);
        if (!personnel.isBlank()) {
            return personnel;
        }
        Location assignedLocation = assignment.getAssignedLocation();
        if (assignedLocation != null && assignedLocation.getName() != null) {
            return "Konum: " + assignedLocation.getName().trim();
        }
        String locationName = nullToEmpty(assignment.getLocationName());
        return locationName.isBlank() ? "" : "Konum: " + locationName;
    }

    private User resolveCurrentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return null;
        }
        return userRepository.findActiveByEmailWithWorkLocations(authentication.getName()).orElse(null);
    }

    private String formatFormDate(LocalDateTime assignmentDate) {
        LocalDate date = assignmentDate != null ? assignmentDate.toLocalDate() : LocalDate.now();
        return date.format(DATE_FORMAT);
    }

    private String formatDeliveryParty(User user, String formDate) {
        return formatDeliveryPartyName(resolveUserDisplayName(user), formDate);
    }

    private String formatDeliveryPartyName(String name, String formDate) {
        String safeName = name != null ? name.trim() : "";
        if (safeName.isBlank()) {
            return formDate != null ? formDate : "";
        }
        if (formDate == null || formDate.isBlank()) {
            return safeName;
        }
        return safeName + " / " + formDate;
    }

    private String resolveUserDisplayName(User user) {
        if (user == null) {
            return "";
        }
        if (user.getDisplayName() != null && !user.getDisplayName().isBlank()) {
            return user.getDisplayName().trim();
        }
        String firstName = user.getFirstName() != null ? user.getFirstName().trim() : "";
        String lastName = user.getLastName() != null ? user.getLastName().trim() : "";
        String combined = (firstName + " " + lastName).trim();
        if (!combined.isBlank()) {
            return combined;
        }
        return user.getEmail() != null ? user.getEmail().trim() : "";
    }

    private String resolveModelName(StockItem stockItem, Product product) {
        DeviceModel model = null;
        if (stockItem != null && stockItem.getDeviceModel() != null) {
            model = stockItem.getDeviceModel();
        } else if (product != null && product.getDeviceModel() != null) {
            model = product.getDeviceModel();
        }
        return formatDeviceModel(model);
    }

    private String formatDeviceModel(DeviceModel model) {
        if (model == null) {
            return "";
        }
        String brand = model.getBrand();
        String name = model.getName();
        if (brand != null && !brand.isBlank() && name != null && !name.isBlank()) {
            return brand + " " + name;
        }
        if (name != null && !name.isBlank()) {
            return name;
        }
        return brand != null ? brand : "";
    }

    private String resolveSerialNumber(StockItem stockItem) {
        if (stockItem == null || stockItem.getSerialNumber() == null) {
            return "";
        }
        return stockItem.getSerialNumber();
    }

    private String resolveDescription(Assignment assignment, StockItem stockItem, Product product) {
        if (assignment.getNotes() != null && !assignment.getNotes().isBlank()) {
            return assignment.getNotes();
        }
        if (stockItem != null && stockItem.getNotes() != null && !stockItem.getNotes().isBlank()) {
            return stockItem.getNotes();
        }
        if (product != null && product.getDescription() != null && !product.getDescription().isBlank()) {
            return product.getDescription();
        }
        return "";
    }

    private void setCellValue(Sheet sheet, String cellRef, String value) {
        CellReference reference = new CellReference(cellRef);
        Row row = sheet.getRow(reference.getRow());
        if (row == null) {
            row = sheet.createRow(reference.getRow());
        }
        Cell cell = row.getCell(reference.getCol());
        if (cell == null) {
            cell = row.createCell(reference.getCol());
        }
        cell.setCellValue(value != null ? value : "");
    }

    private String buildFormFileName(Assignment assignment) {
        String userPart = "zimmet";
        if (assignment.getAssignedUser() != null && assignment.getAssignedUser().getFullName() != null) {
            userPart = assignment.getAssignedUser().getFullName()
                    .replaceAll("[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ._-]", "_");
        }
        return "Zimmet_Formu_" + assignment.getId() + "_" + userPart + ".xlsx";
    }

    private String buildReturnFormFileName(Assignment assignment) {
        String partyPart = "iade";
        String name = resolveSignaturePartyName(assignment);
        if (name != null && !name.isBlank()) {
            partyPart = name.replaceAll("[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ._-]", "_");
        }
        return "Zimmet_Iade_Formu_" + assignment.getId() + "_" + partyPart + ".xlsx";
    }

    private AssignmentSignedFormDto toSignedFormDto(Assignment assignment) {
        return new AssignmentSignedFormDto(
                true,
                assignment.getSignedFormFileName(),
                assignment.getSignedFormContentType(),
                assignment.getSignedFormUploadedAt()
        );
    }

    private boolean isAllowedSignedFormType(String contentType, String filename) {
        if (contentType != null) {
            String lower = contentType.toLowerCase();
            if ("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet".equals(lower)) {
                return true;
            }
        }
        if (filename != null) {
            String lower = filename.toLowerCase();
            return lower.endsWith(".xlsx");
        }
        return false;
    }

    private void deleteStoredFile(String storedPath) {
        if (storedPath == null || storedPath.isBlank()) {
            return;
        }
        try {
            Files.deleteIfExists(getUploadBasePath().resolve(storedPath));
        } catch (IOException ignored) {
            // Eski dosya silinemezse yeni yükleme yine de devam eder
        }
    }

    private Path getUploadBasePath() {
        return Path.of(uploadDir).toAbsolutePath().normalize();
    }

    private String nullToEmpty(String value) {
        return value != null ? value : "";
    }

    private String sanitizePlaceholder(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        if ("unknown".equalsIgnoreCase(value.trim())) {
            return "";
        }
        return value.trim();
    }
}
