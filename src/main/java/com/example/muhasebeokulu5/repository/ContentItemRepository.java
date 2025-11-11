package com.example.muhasebeokulu5.repository;

import com.example.muhasebeokulu5.entities.ContentItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentItemRepository extends JpaRepository<ContentItem, Long> {

    List<ContentItem> findByCardSectionIdOrderByDisplayOrderAsc(Long cardSectionId);

    List<ContentItem> findByCardSectionIdAndIsActiveTrueOrderByDisplayOrderAsc(Long cardSectionId);
}
