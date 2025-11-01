package com.example.muhasebeokulu5.repository;

import com.example.muhasebeokulu5.entities.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {

    List<Topic> findAllByOrderByNameAsc();

    boolean existsByName(String name);
}
