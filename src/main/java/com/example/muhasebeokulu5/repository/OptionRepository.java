package com.example.muhasebeokulu5.repository;

import com.example.muhasebeokulu5.entities.Option;
import com.example.muhasebeokulu5.entities.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OptionRepository extends JpaRepository<Option, Long> {

    List<Option> findByQuestionOrderByOptionOrderAsc(Question question);

    Optional<Option> findByQuestionAndIsCorrectTrue(Question question);
}
