package com.quizapp.service;

import com.quizapp.dto.AdaptiveProfileDTO;
import com.quizapp.entity.StudentProfileEntity;
import com.quizapp.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentProfileService {

    private final StudentProfileRepository profileRepository;

    public AdaptiveProfileDTO getProfile(Long studentId) {
        StudentProfileEntity profile = profileRepository.findByUserId(studentId).orElseGet(() -> {
            // Provide a mock intelligent baseline if no data exists yet
            StudentProfileEntity p = new StudentProfileEntity();
            p.setWeakAreas("Operating Systems - Deadlocks,Networks - Subnetting");
            p.setStrongAreas("DBMS - Normalization,DSA - Arrays");
            p.setPreferredDifficulty("MEDIUM");
            p.setAvgResponseTime(18.4);
            return p;
        });

        List<String> weakAreas = profile.getWeakAreas() != null ? Arrays.asList(profile.getWeakAreas().split(",")) : List.of();
        List<String> strongAreas = profile.getStrongAreas() != null ? Arrays.asList(profile.getStrongAreas().split(",")) : List.of();

        return AdaptiveProfileDTO.builder()
                .studentId(studentId)
                .weakAreas(weakAreas)
                .strongAreas(strongAreas)
                .preferredDifficulty(profile.getPreferredDifficulty())
                .avgResponseTime(profile.getAvgResponseTime())
                .build();
    }
}
