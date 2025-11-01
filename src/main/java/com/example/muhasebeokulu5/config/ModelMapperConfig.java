package com.example.muhasebeokulu5.config;

import com.example.muhasebeokulu5.dto.SolvedProblemDTO;
import com.example.muhasebeokulu5.entities.SolvedProblem;
import org.modelmapper.ModelMapper;
import org.modelmapper.PropertyMap;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper mapper = new ModelMapper();

        // Problem başlığını direkt olarak ekle
        mapper.addMappings(new PropertyMap<SolvedProblem, SolvedProblemDTO>() {
            @Override
            protected void configure() {
                map().setProblemTitle(source.getProblem().getTitle());
            }
        });

        return mapper;
    }
}
