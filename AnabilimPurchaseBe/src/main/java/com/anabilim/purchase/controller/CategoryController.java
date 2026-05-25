package com.anabilim.purchase.controller;

import com.anabilim.purchase.dto.request.CreateCategoryDto;
import com.anabilim.purchase.dto.request.UpdateCategoryDto;
import com.anabilim.purchase.dto.response.CategoryDetailDto;
import com.anabilim.purchase.dto.response.CategoryDto;
import com.anabilim.purchase.service.CategoryRequestService;
import com.anabilim.purchase.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final CategoryRequestService categoryRequestService;

    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody CreateCategoryDto createDto) {
        return new ResponseEntity<>(categoryService.createCategory(createDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDto> updateCategory(@PathVariable Long id, @Valid @RequestBody UpdateCategoryDto updateDto) {
        return ResponseEntity.ok(categoryService.updateCategory(id, updateDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDto> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @GetMapping("/{id}/detail")
    public ResponseEntity<CategoryDetailDto> getCategoryDetail(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryDetail(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<CategoryDto> getCategoryByCode(@PathVariable String code) {
        return ResponseEntity.ok(categoryService.getCategoryByCode(code));
    }

    @GetMapping("/all")
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/active")
    public ResponseEntity<List<CategoryDto>> getActiveCategories() {
        return ResponseEntity.ok(categoryService.getActiveCategories());
    }

    @GetMapping("/search")
    public ResponseEntity<List<CategoryDto>> searchCategories(@RequestParam String name) {
        return ResponseEntity.ok(categoryService.searchCategories(name));
    }

    @PostMapping("/{id}/request")
    public ResponseEntity<Void> requestCategory(
            @PathVariable Long id,
            @RequestBody(required = false) CategoryRequestBody body,
            @AuthenticationPrincipal UserDetails user) {
        String email = user != null ? user.getUsername() : "unknown";
        categoryRequestService.submitCategoryRequest(id, email, body != null ? body.getNote() : null);
        return ResponseEntity.ok().build();
    }

    @lombok.Data
    public static class CategoryRequestBody {
        private String note;
    }
}
