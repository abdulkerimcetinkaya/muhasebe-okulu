package com.example.muhasebeokulu5.service;

import com.example.muhasebeokulu5.dto.TopicDTO;
import com.example.muhasebeokulu5.entities.Topic;
import com.example.muhasebeokulu5.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TopicService {

    private final TopicRepository topicRepository;
    private final ModelMapper modelMapper;

    @Transactional
    public TopicDTO createTopic(TopicDTO topicDTO) {
        if (topicRepository.existsByName(topicDTO.getName())) {
            throw new RuntimeException("Bu isimde bir konu zaten mevcut");
        }

        Topic topic = new Topic();
        topic.setName(topicDTO.getName());
        topic.setDescription(topicDTO.getDescription());

        Topic savedTopic = topicRepository.save(topic);
        return convertToDTO(savedTopic);
    }

    @Transactional
    public TopicDTO updateTopic(Long id, TopicDTO topicDTO) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Konu bulunamadı"));

        topic.setName(topicDTO.getName());
        topic.setDescription(topicDTO.getDescription());

        Topic updatedTopic = topicRepository.save(topic);
        return convertToDTO(updatedTopic);
    }

    @Transactional
    public void deleteTopic(Long id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Konu bulunamadı"));
        topicRepository.delete(topic);
    }

    public TopicDTO getTopicById(Long id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Konu bulunamadı"));
        return convertToDTO(topic);
    }

    public List<TopicDTO> getAllTopics() {
        return topicRepository.findAllByOrderByNameAsc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private TopicDTO convertToDTO(Topic topic) {
        TopicDTO dto = modelMapper.map(topic, TopicDTO.class);
        dto.setQuizCount(topic.getQuizzes().size());
        return dto;
    }
}
