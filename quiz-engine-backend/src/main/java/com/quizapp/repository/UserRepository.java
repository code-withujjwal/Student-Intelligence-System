package com.quizapp.repository;

import com.quizapp.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByEmail(String email);
    Optional<UserEntity> findByUsername(String username);
    List<UserEntity> findByRole(com.quizapp.entity.Role role);

    @Query("SELECT u FROM UserEntity u ORDER BY u.xp DESC, (u.easySolvedCount + u.mediumSolvedCount + u.hardSolvedCount) DESC, u.dailyChallengeScore DESC")
    List<UserEntity> findTopUsers(Pageable pageable);

    long countByXpGreaterThan(Long xp);
    long countByInstitutionAndXpGreaterThan(String institution, Long xp);
    long countByAcademicStatusAndXpGreaterThan(String academicStatus, Long xp);
}
