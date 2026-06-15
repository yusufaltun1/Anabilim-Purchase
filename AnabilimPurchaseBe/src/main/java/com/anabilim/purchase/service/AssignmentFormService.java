package com.anabilim.purchase.service;

import com.anabilim.purchase.dto.response.AttachmentDownloadResult;
import com.anabilim.purchase.dto.response.AssignmentSignedFormDto;
import com.anabilim.purchase.entity.Assignment;
import com.anabilim.purchase.entity.DeviceModel;
import com.anabilim.purchase.entity.Location;
import com.anabilim.purchase.entity.Product;
import com.anabilim.purchase.entity.StockItem;
import com.anabilim.purchase.entity.User;
import com.anabilim.purchase.util.LocationSupport;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.exception.ValidationException;
import com.anabilim.purchase.repository.AssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellReference;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssignmentFormService {

    private static final String TEMPLATE_PATH = "Zimmet_Formu.xlsx";
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd.MM.yyyy");
    private static final long MAX_FILE_SIZE = 20L * 1024 * 1024;

    private final AssignmentRepository assignmentRepository;

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
             Workbook workbook = new XSSFWorkbook(template);
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.getSheetAt(0);
            fillForm(sheet, assignment);
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new ValidationException("Zimmet formu oluşturulamadı: " + e.getMessage());
        }
    }

    private void fillForm(Sheet sheet, Assignment assignment) {
        User user = assignment.getAssignedUser();
        Product product = assignment.getProduct();
        StockItem stockItem = assignment.getStockItem();

        setCellValue(sheet, "C3", resolveSchoolName(assignment));
        setCellValue(sheet, "C4", user != null ? nullToEmpty(user.getFullName()) : "");
        setCellValue(sheet, "C5", assignment.getAssignmentDate() != null
                ? assignment.getAssignmentDate().format(DATE_FORMAT) : "");
        setCellValue(sheet, "F3", user != null ? sanitizePlaceholder(user.getDepartment()) : "");
        setCellValue(sheet, "F4", user != null ? sanitizePlaceholder(user.getPosition()) : "");
        setCellValue(sheet, "F5", resolveWorkLocation(assignment, user));

        if (product != null) {
            setCellValue(sheet, "B8", nullToEmpty(product.getName()));
        }
        setCellValue(sheet, "C8", resolveModelName(stockItem, product));
        setCellValue(sheet, "D8", resolveSerialNumber(stockItem));
        setCellValue(sheet, "E8", resolveDescription(assignment, stockItem, product));
    }

    private String resolveSchoolName(Assignment assignment) {
        User user = assignment.getAssignedUser();
        if (user != null && user.getSchool() != null) {
            return nullToEmpty(user.getSchool().getName());
        }
        StockItem stockItem = assignment.getStockItem();
        if (stockItem != null && stockItem.getSchool() != null) {
            return nullToEmpty(stockItem.getSchool().getName());
        }
        return "";
    }

    private String resolveWorkLocation(Assignment assignment, User user) {
        String userLocation = resolveUserWorkLocation(user);
        if (!userLocation.isBlank()) {
            return userLocation;
        }
        if (assignment.getAssignedLocation() != null) {
            String name = assignment.getAssignedLocation().getName();
            if (assignment.getLocationDetails() != null && !assignment.getLocationDetails().isBlank()) {
                return name + " - " + assignment.getLocationDetails();
            }
            return nullToEmpty(name);
        }
        if (assignment.getLocationName() != null && !assignment.getLocationName().isBlank()) {
            if (assignment.getLocationDetails() != null && !assignment.getLocationDetails().isBlank()) {
                return assignment.getLocationName() + " - " + assignment.getLocationDetails();
            }
            return assignment.getLocationName();
        }
        StockItem stockItem = assignment.getStockItem();
        if (stockItem != null) {
            return formatLocationChain(stockItem.getDefaultParentLocation(), stockItem.getDefaultChildLocation());
        }
        return "";
    }

    private String formatLocationChain(Location parent, Location child) {
        List<String> parts = new ArrayList<>();
        if (parent != null && parent.getName() != null && !parent.getName().isBlank()) {
            parts.add(parent.getName());
        }
        if (child != null && child.getName() != null && !child.getName().isBlank()) {
            parts.add(child.getName());
        }
        return String.join(" / ", parts);
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
            if (lower.startsWith("image/")) {
                return true;
            }
            if ("application/pdf".equals(lower)) {
                return true;
            }
            if ("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet".equals(lower)) {
                return true;
            }
        }
        if (filename != null) {
            String lower = filename.toLowerCase();
            return lower.endsWith(".pdf") || lower.endsWith(".xlsx")
                    || lower.endsWith(".jpg") || lower.endsWith(".jpeg")
                    || lower.endsWith(".png") || lower.endsWith(".gif") || lower.endsWith(".webp");
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

    private String resolveUserWorkLocation(User user) {
        if (user == null) {
            return "";
        }
        if (user.getWorkLocationChild() != null) {
            return LocationSupport.path(user.getWorkLocationChild());
        }
        if (user.getWorkLocationParent() != null) {
            return LocationSupport.path(user.getWorkLocationParent());
        }
        return sanitizePlaceholder(user.getWorkLocation());
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
