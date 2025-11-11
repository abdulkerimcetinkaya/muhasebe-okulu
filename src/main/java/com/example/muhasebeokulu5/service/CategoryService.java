package com.example.muhasebeokulu5.service;

import com.example.muhasebeokulu5.dto.CategoryDTO;
import com.example.muhasebeokulu5.entities.Category;
import com.example.muhasebeokulu5.exception.ResourceNotFoundException;
import com.example.muhasebeokulu5.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ModelMapper modelMapper;

    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + id));
        return convertToDTO(category);
    }

    @Transactional
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        if (categoryRepository.existsByName(categoryDTO.getName())) {
            throw new IllegalArgumentException("Bu isimde bir kategori zaten mevcut: " + categoryDTO.getName());
        }

        Category category = new Category();
        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());
        category.setDisplayOrder(categoryDTO.getDisplayOrder() != null ? categoryDTO.getDisplayOrder() : 0);

        Category saved = categoryRepository.save(category);
        return convertToDTO(saved);
    }

    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + id));

        // İsim değiştiriliyorsa ve yeni isim başka bir kategoride kullanılmışsa hata ver
        if (!category.getName().equals(categoryDTO.getName()) &&
                categoryRepository.existsByName(categoryDTO.getName())) {
            throw new IllegalArgumentException("Bu isimde bir kategori zaten mevcut: " + categoryDTO.getName());
        }

        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());
        category.setDisplayOrder(categoryDTO.getDisplayOrder() != null ? categoryDTO.getDisplayOrder() : 0);

        Category updated = categoryRepository.save(category);
        return convertToDTO(updated);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + id));

        // Not: Problem-Category relationship has been removed
        // Categories can now be deleted freely

        categoryRepository.delete(category);
    }

    private CategoryDTO convertToDTO(Category category) {
        CategoryDTO dto = modelMapper.map(category, CategoryDTO.class);
        // Problem-Category relationship removed, setting problem count to 0
        dto.setProblemCount(0L);
        return dto;
    }
}
