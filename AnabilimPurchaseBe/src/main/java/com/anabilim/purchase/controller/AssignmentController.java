package com.anabilim.purchase.controller;

import com.anabilim.purchase.dto.ApiResponse;
import com.anabilim.purchase.dto.request.CreateAssignmentDto;
import com.anabilim.purchase.dto.response.AssignmentDto;
import com.anabilim.purchase.dto.response.AssignmentFormPhotoDto;
import com.anabilim.purchase.dto.response.AssignmentSignedFormDto;
import com.anabilim.purchase.dto.response.AttachmentDownloadResult;
import com.anabilim.purchase.entity.enums.AssignmentStatus;
import com.anabilim.purchase.service.AssignmentFormService;
import com.anabilim.purchase.service.AssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assignments")
@RequiredArgsConstructor
public class AssignmentController {
    
    private final AssignmentService assignmentService;
    private final AssignmentFormService assignmentFormService;
    
    // ========== CRUD İşlemleri ==========
    
    @PostMapping
    public ResponseEntity<ApiResponse<AssignmentDto>> createAssignment(@RequestBody CreateAssignmentDto dto) {
        AssignmentDto createdAssignment = assignmentService.createAssignment(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Zimmet başarıyla oluşturuldu", createdAssignment));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssignmentDto>> getAssignmentById(@PathVariable Long id) {
        AssignmentDto assignment = assignmentService.getAssignmentById(id);
        return ResponseEntity.ok(ApiResponse.success("Zimmet bulundu", assignment));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<AssignmentDto>>> getAllAssignments() {
        List<AssignmentDto> assignments = assignmentService.getAllAssignments();
        return ResponseEntity.ok(ApiResponse.success("Tüm zimmetler listelendi", assignments));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAssignment(@PathVariable Long id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.ok(ApiResponse.success("Zimmet iptal edildi, bağlı stok hareketi silindi", null));
    }
    
    // ========== Ürün Bazlı İşlemler ==========
    
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<AssignmentDto>>> getAssignmentsByProductId(@PathVariable Long productId) {
        List<AssignmentDto> assignments = assignmentService.getAssignmentsByProductId(productId);
        return ResponseEntity.ok(ApiResponse.success(
                "Ürün ID: " + productId + " için zimmetler listelendi", assignments));
    }
    
    @GetMapping("/product/{productId}/status/{status}")
    public ResponseEntity<ApiResponse<List<AssignmentDto>>> getAssignmentsByProductIdAndStatus(
            @PathVariable Long productId, 
            @PathVariable AssignmentStatus status) {
        List<AssignmentDto> assignments = assignmentService.getAssignmentsByProductIdAndStatus(productId, status);
        return ResponseEntity.ok(ApiResponse.success(
                "Ürün ID: " + productId + " ve durum: " + status + " için zimmetler listelendi", assignments));
    }

    @GetMapping("/stock-item/{stockItemId}")
    public ResponseEntity<ApiResponse<List<AssignmentDto>>> getAssignmentsByStockItemId(
            @PathVariable Long stockItemId) {
        List<AssignmentDto> assignments = assignmentService.getAssignmentsByStockItemId(stockItemId);
        return ResponseEntity.ok(ApiResponse.success(
                "Stock item ID: " + stockItemId + " için zimmetler listelendi", assignments));
    }
    
    // ========== Kullanıcı Bazlı İşlemler ==========
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<AssignmentDto>>> getAssignmentsByUserId(@PathVariable Long userId) {
        List<AssignmentDto> assignments = assignmentService.getAssignmentsByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(
                "Kullanıcı ID: " + userId + " için zimmetler listelendi", assignments));
    }
    
    @GetMapping("/user/{userId}/status/{status}")
    public ResponseEntity<ApiResponse<List<AssignmentDto>>> getAssignmentsByUserIdAndStatus(
            @PathVariable Long userId, 
            @PathVariable AssignmentStatus status) {
        List<AssignmentDto> assignments = assignmentService.getAssignmentsByUserIdAndStatus(userId, status);
        return ResponseEntity.ok(ApiResponse.success(
                "Kullanıcı ID: " + userId + " ve durum: " + status + " için zimmetler listelendi", assignments));
    }
    
    @GetMapping("/user/{userId}/active")
    public ResponseEntity<ApiResponse<List<AssignmentDto>>> getActiveAssignmentsByUserId(@PathVariable Long userId) {
        List<AssignmentDto> assignments = assignmentService.getActiveAssignmentsByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(
                "Kullanıcı ID: " + userId + " için aktif zimmetler listelendi", assignments));
    }
    
    // ========== Konum Bazlı İşlemler ==========
    
    @GetMapping("/location/{locationId}")
    public ResponseEntity<ApiResponse<List<AssignmentDto>>> getAssignmentsByLocationId(@PathVariable Long locationId) {
        List<AssignmentDto> assignments = assignmentService.getAssignmentsByLocationId(locationId);
        return ResponseEntity.ok(ApiResponse.success(
                "Konum ID: " + locationId + " için zimmetler listelendi", assignments));
    }
    
    // ========== Konum Bazlı İşlemler ==========
    
    @GetMapping("/location")
    public ResponseEntity<ApiResponse<List<AssignmentDto>>> getAssignmentsByLocation(
            @RequestParam String locationName) {
        List<AssignmentDto> assignments = assignmentService.getAssignmentsByLocation(locationName);
        return ResponseEntity.ok(ApiResponse.success(
                "Konum: " + locationName + " için zimmetler listelendi", assignments));
    }
    
    @GetMapping("/location/active")
    public ResponseEntity<ApiResponse<List<AssignmentDto>>> getActiveAssignmentsByLocation(
            @RequestParam String locationName) {
        List<AssignmentDto> assignments = assignmentService.getActiveAssignmentsByLocation(locationName);
        return ResponseEntity.ok(ApiResponse.success(
                "Konum: " + locationName + " için aktif zimmetler listelendi", assignments));
    }
    
    // ========== Durum İşlemleri ==========
    
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<AssignmentDto>>> getAssignmentsByStatus(@PathVariable AssignmentStatus status) {
        List<AssignmentDto> assignments = assignmentService.getAssignmentsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(
                "Durum: " + status + " için zimmetler listelendi", assignments));
    }
    
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<AssignmentDto>>> getActiveAssignments() {
        List<AssignmentDto> assignments = assignmentService.getActiveAssignments();
        return ResponseEntity.ok(ApiResponse.success("Aktif zimmetler listelendi", assignments));
    }
    
    @GetMapping("/expired")
    public ResponseEntity<ApiResponse<List<AssignmentDto>>> getExpiredAssignments() {
        List<AssignmentDto> assignments = assignmentService.getExpiredAssignments();
        return ResponseEntity.ok(ApiResponse.success("Süresi dolmuş zimmetler listelendi", assignments));
    }
    
    // ========== Zimmet Formu ==========

    @GetMapping("/{id}/form/download")
    public ResponseEntity<org.springframework.core.io.Resource> downloadAssignmentForm(@PathVariable Long id) {
        AttachmentDownloadResult result = assignmentFormService.downloadFilledForm(id);
        MediaType mediaType = MediaType.parseMediaType(
                result.getContentType() != null ? result.getContentType()
                        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + result.getFileName() + "\"")
                .body(result.getResource());
    }

    @PostMapping(value = "/{id}/form/signed", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AssignmentSignedFormDto>> uploadSignedAssignmentForm(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        AssignmentSignedFormDto dto = assignmentFormService.uploadSignedForm(id, file);
        return ResponseEntity.ok(ApiResponse.success("İmzalı zimmet formu yüklendi", dto));
    }

    @GetMapping("/{id}/form/signed")
    public ResponseEntity<org.springframework.core.io.Resource> downloadSignedAssignmentForm(@PathVariable Long id) {
        AttachmentDownloadResult result = assignmentFormService.downloadSignedForm(id);
        MediaType mediaType = MediaType.parseMediaType(
                result.getContentType() != null ? result.getContentType() : "application/octet-stream");
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + result.getFileName() + "\"")
                .body(result.getResource());
    }

    @PostMapping(value = "/{id}/form/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AssignmentFormPhotoDto>> uploadAssignmentFormPhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        AssignmentFormPhotoDto dto = assignmentFormService.uploadFormPhoto(id, file);
        return ResponseEntity.ok(ApiResponse.success("Ürün fotoğrafı yüklendi", dto));
    }

    @GetMapping("/{id}/form/photo")
    public ResponseEntity<org.springframework.core.io.Resource> downloadAssignmentFormPhoto(@PathVariable Long id) {
        AttachmentDownloadResult result = assignmentFormService.downloadFormPhoto(id);
        MediaType mediaType = MediaType.parseMediaType(
                result.getContentType() != null ? result.getContentType() : "application/octet-stream");
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + result.getFileName() + "\"")
                .body(result.getResource());
    }

    // ========== Zimmet İşlemleri ==========
    
    @PostMapping("/{id}/return")
    public ResponseEntity<ApiResponse<AssignmentDto>> returnAssignment(@PathVariable Long id) {
        AssignmentDto returnedAssignment = assignmentService.returnAssignment(id);
        return ResponseEntity.ok(ApiResponse.success("Zimmet başarıyla iade edildi", returnedAssignment));
    }
    
    @PostMapping("/{id}/lost")
    public ResponseEntity<ApiResponse<AssignmentDto>> markAssignmentAsLost(@PathVariable Long id) {
        AssignmentDto lostAssignment = assignmentService.markAssignmentAsLost(id);
        return ResponseEntity.ok(ApiResponse.success("Zimmet kayıp olarak işaretlendi", lostAssignment));
    }
    
    @PostMapping("/{id}/damaged")
    public ResponseEntity<ApiResponse<AssignmentDto>> markAssignmentAsDamaged(@PathVariable Long id) {
        AssignmentDto damagedAssignment = assignmentService.markAssignmentAsDamaged(id);
        return ResponseEntity.ok(ApiResponse.success("Zimmet hasarlı olarak işaretlendi", damagedAssignment));
    }
    
    @PostMapping("/{id}/transfer/user")
    public ResponseEntity<ApiResponse<AssignmentDto>> transferAssignmentToUser(
            @PathVariable Long id,
            @RequestParam Long newUserId,
            @RequestParam(required = false) Long newLocationId) {
        AssignmentDto transferredAssignment = assignmentService.transferAssignmentToUser(id, newUserId, newLocationId);
        return ResponseEntity.ok(ApiResponse.success("Zimmet kullanıcıya transfer edildi", transferredAssignment));
    }
    
    @PostMapping("/{id}/transfer/location")
    public ResponseEntity<ApiResponse<AssignmentDto>> transferAssignmentToLocation(
            @PathVariable Long id,
            @RequestParam String newLocationName,
            @RequestParam(required = false) String newLocationDetails) {
        AssignmentDto transferredAssignment = assignmentService.transferAssignmentToLocation(id, newLocationName, newLocationDetails);
        return ResponseEntity.ok(ApiResponse.success("Zimmet konuma transfer edildi", transferredAssignment));
    }
    
    // ========== Sayım İşlemleri ==========
    
    @GetMapping("/count/product/{productId}")
    public ResponseEntity<ApiResponse<Long>> countAssignmentsByProductId(@PathVariable Long productId) {
        long count = assignmentService.countAssignmentsByProductId(productId);
        return ResponseEntity.ok(ApiResponse.success(
                "Ürün ID: " + productId + " için zimmet sayısı", count));
    }
    
    @GetMapping("/count/product/{productId}/status/{status}")
    public ResponseEntity<ApiResponse<Long>> countAssignmentsByProductIdAndStatus(
            @PathVariable Long productId, 
            @PathVariable AssignmentStatus status) {
        long count = assignmentService.countAssignmentsByProductIdAndStatus(productId, status);
        return ResponseEntity.ok(ApiResponse.success(
                "Ürün ID: " + productId + " ve durum: " + status + " için zimmet sayısı", count));
    }
    
    @GetMapping("/count/user/{userId}")
    public ResponseEntity<ApiResponse<Long>> countAssignmentsByUserId(@PathVariable Long userId) {
        long count = assignmentService.countAssignmentsByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(
                "Kullanıcı ID: " + userId + " için zimmet sayısı", count));
    }
    
    @GetMapping("/count/user/{userId}/status/{status}")
    public ResponseEntity<ApiResponse<Long>> countAssignmentsByUserIdAndStatus(
            @PathVariable Long userId, 
            @PathVariable AssignmentStatus status) {
        long count = assignmentService.countAssignmentsByUserIdAndStatus(userId, status);
        return ResponseEntity.ok(ApiResponse.success(
                "Kullanıcı ID: " + userId + " ve durum: " + status + " için zimmet sayısı", count));
    }
    
    @GetMapping("/count/location/{locationId}")
    public ResponseEntity<ApiResponse<Long>> countAssignmentsByLocationId(@PathVariable Long locationId) {
        long count = assignmentService.countAssignmentsByLocationId(locationId);
        return ResponseEntity.ok(ApiResponse.success(
                "Konum ID: " + locationId + " için zimmet sayısı", count));
    }
    
    @GetMapping("/count/location")
    public ResponseEntity<ApiResponse<Long>> countAssignmentsByLocation(@RequestParam String locationName) {
        long count = assignmentService.countAssignmentsByLocation(locationName);
        return ResponseEntity.ok(ApiResponse.success(
                "Konum: " + locationName + " için zimmet sayısı", count));
    }
    
    @GetMapping("/count/status/{status}")
    public ResponseEntity<ApiResponse<Long>> countAssignmentsByStatus(@PathVariable AssignmentStatus status) {
        long count = assignmentService.countAssignmentsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(
                "Durum: " + status + " için zimmet sayısı", count));
    }
    
    @GetMapping("/count/active")
    public ResponseEntity<ApiResponse<Long>> countActiveAssignments() {
        long count = assignmentService.countActiveAssignments();
        return ResponseEntity.ok(ApiResponse.success("Aktif zimmet sayısı", count));
    }
    
    // ========== Aktif/Pasif İşlemler ==========
    
    @GetMapping("/active-only")
    public ResponseEntity<ApiResponse<List<AssignmentDto>>> getActiveAssignmentsOnly() {
        List<AssignmentDto> assignments = assignmentService.getActiveAssignmentsOnly();
        return ResponseEntity.ok(ApiResponse.success("Sadece aktif zimmetler listelendi", assignments));
    }
    
    @PostMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<AssignmentDto>> activateAssignment(@PathVariable Long id) {
        AssignmentDto activatedAssignment = assignmentService.activateAssignment(id);
        return ResponseEntity.ok(ApiResponse.success("Zimmet aktif hale getirildi", activatedAssignment));
    }
    
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<AssignmentDto>> deactivateAssignment(@PathVariable Long id) {
        AssignmentDto deactivatedAssignment = assignmentService.deactivateAssignment(id);
        return ResponseEntity.ok(ApiResponse.success("Zimmet pasif hale getirildi", deactivatedAssignment));
    }
    
    // ========== Otomatik İşlemler ==========
    
    @PostMapping("/auto-close-expired")
    public ResponseEntity<ApiResponse<Void>> autoCloseExpiredAssignments() {
        assignmentService.autoCloseExpiredAssignments();
        return ResponseEntity.ok(ApiResponse.success("Süresi dolmuş zimmetler otomatik olarak kapatıldı", null));
    }
}
