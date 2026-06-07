package com.quizapp.config;

import com.quizapp.entity.*;
import com.quizapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final AttemptAnswerRepository attemptAnswerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 1. Seed Users
        if (userRepository.findByEmail("recruiter@enterprise.com").isPresent()) {
            // Already seeded
            return;
        }

        System.out.println("Seeding database with test telemetry records...");

        UserEntity teacher = new UserEntity();
        teacher.setFullName("Dr. Karl");
        teacher.setUsername("karl");
        teacher.setEmail("recruiter@enterprise.com");
        teacher.setPassword(passwordEncoder.encode("Demo123!"));
        teacher.setRole(Role.TEACHER);
        teacher.setInstitution("Nexus Institute of Technology");
        teacher.setAcademicStatus("Professor");
        teacher = userRepository.save(teacher);

        UserEntity student1 = new UserEntity();
        student1.setFullName("Rahul Sharma");
        student1.setUsername("rahul");
        student1.setEmail("student1@quiz.com");
        student1.setPassword(passwordEncoder.encode("Demo123!"));
        student1.setRole(Role.STUDENT);
        student1.setInstitution("Nexus Institute of Technology");
        student1.setAcademicStatus("Undergraduate");
        student1.setXp(1850L);
        student1.setEasySolvedCount(25L);
        student1.setMediumSolvedCount(15L);
        student1.setHardSolvedCount(5L);
        student1 = userRepository.save(student1);

        UserEntity student2 = new UserEntity();
        student2.setFullName("Aman Verma");
        student2.setUsername("aman");
        student2.setEmail("student2@quiz.com");
        student2.setPassword(passwordEncoder.encode("Demo123!"));
        student2.setRole(Role.STUDENT);
        student2.setInstitution("Nexus Institute of Technology");
        student2.setAcademicStatus("Undergraduate");
        student2.setXp(980L);
        student2.setEasySolvedCount(12L);
        student2.setMediumSolvedCount(8L);
        student2.setHardSolvedCount(2L);
        student2 = userRepository.save(student2);

        // 2. Seed Questions
        QuestionEntity q1 = createQuestion("AVL_ROTATION", "AVL Tree Balance Rotations", 
                "What is the maximum height of an AVL tree with n nodes?", 
                "MCQ", "DSA", "HARD", 2.0, teacher,
                Arrays.asList("O(log n)", "O(n)", "O(n log n)", "O(1)"), 0);

        QuestionEntity q2 = createQuestion("SQL_JOINS", "SQL Outer Join Functions", 
                "Which SQL join returns all rows when there is a match in one of the tables?", 
                "MCQ", "DBMS", "MEDIUM", 1.0, teacher,
                Arrays.asList("INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"), 3);

        QuestionEntity q3 = createQuestion("SEMAPHORES", "Operating System Semaphores", 
                "A semaphore is a shared integer variable that can only be accessed via which atomic operations?", 
                "MCQ", "OS", "MEDIUM", 1.0, teacher,
                Arrays.asList("wait and signal", "lock and unlock", "read and write", "push and pop"), 0);

        QuestionEntity q4 = createQuestion("CONCURRENCY", "Database Concurrency Protocols", 
                "Which concurrency control protocol guarantees conflict serializability?", 
                "MCQ", "DBMS", "HARD", 2.0, teacher,
                Arrays.asList("Two-Phase Locking (2PL)", "Timestamp Ordering", "Validation-based", "All of the above"), 3);

        // 3. Seed Quizzes
        QuizEntity quiz1 = new QuizEntity();
        quiz1.setTitle("DSA Sessional Paper I");
        quiz1.setSubject("DSA");
        quiz1.setDescription("Sessional examination covering advanced tree structures, AVL rotations, and graph traversals.");
        quiz1.setTeacher(teacher);
        quiz1.setStatus("ACTIVE");
        quiz1.setDurationMinutes(45);
        quiz1.setMaxAttempts(1);
        quiz1.setSettings("{\"units\":[1,2,3],\"composition\":{\"conceptual\":40,\"analytical\":40,\"code\":20},\"deployedTo\":\"All Students\"}");
        
        QuizSectionEntity sec1 = new QuizSectionEntity();
        sec1.setTitle("Conceptual & Analytical");
        sec1.setSectionOrder(0);
        sec1.setQuiz(quiz1);
        
        QuizQuestionEntity qq1 = new QuizQuestionEntity();
        qq1.setSection(sec1);
        qq1.setQuestion(q1);
        qq1.setQuestionOrder(0);
        qq1.setMarksOverride(2.0);
        
        QuizQuestionEntity qq2 = new QuizQuestionEntity();
        qq2.setSection(sec1);
        qq2.setQuestion(q2);
        qq2.setQuestionOrder(1);
        qq2.setMarksOverride(1.0);
        
        sec1.setQuestions(new ArrayList<>(Arrays.asList(qq1, qq2)));
        quiz1.setSections(new ArrayList<>(Arrays.asList(sec1)));
        quiz1 = quizRepository.save(quiz1);

        QuizEntity quiz2 = new QuizEntity();
        quiz2.setTitle("DBMS Remedial Patch Run");
        quiz2.setSubject("DBMS");
        quiz2.setDescription("Targeted remedial session reviewing transactional locks, 2PL validation, and relational algebra.");
        quiz2.setTeacher(teacher);
        quiz2.setStatus("ACTIVE");
        quiz2.setDurationMinutes(30);
        quiz2.setMaxAttempts(1);
        quiz2.setSettings("{\"units\":[3,4],\"composition\":{\"conceptual\":70,\"analytical\":30,\"code\":0},\"deployedTo\":\"Mastery < 50%\"}");
        
        QuizSectionEntity sec2 = new QuizSectionEntity();
        sec2.setTitle("Remedial Roster Core");
        sec2.setSectionOrder(0);
        sec2.setQuiz(quiz2);
        
        QuizQuestionEntity qq3 = new QuizQuestionEntity();
        qq3.setSection(sec2);
        qq3.setQuestion(q3);
        qq3.setQuestionOrder(0);
        qq3.setMarksOverride(1.0);
        
        QuizQuestionEntity qq4 = new QuizQuestionEntity();
        qq4.setSection(sec2);
        qq4.setQuestion(q4);
        qq4.setQuestionOrder(1);
        qq4.setMarksOverride(2.0);
        
        sec2.setQuestions(new ArrayList<>(Arrays.asList(qq3, qq4)));
        quiz2.setSections(new ArrayList<>(Arrays.asList(sec2)));
        quiz2 = quizRepository.save(quiz2);

        // 4. Seed Quiz Attempts
        // Rahul Sharma's attempt on DSA Sessional Paper I
        QuizAttemptEntity attempt1 = new QuizAttemptEntity();
        attempt1.setQuiz(quiz1);
        attempt1.setUser(student1);
        attempt1.setStatus("SUBMITTED");
        attempt1.setScore(2.0); // Got AVL correct (+2), SQL_JOINS incorrect (+0)
        attempt1.setStartedAt(LocalDateTime.now().minusMinutes(25));
        attempt1.setCompletedAt(LocalDateTime.now().minusMinutes(5));
        attempt1 = quizAttemptRepository.save(attempt1);

        AttemptAnswerEntity ans1 = new AttemptAnswerEntity();
        ans1.setAttempt(attempt1);
        ans1.setQuestion(q1);
        ans1.setSelectedOptionIds("[\"" + q1.getOptions().get(0).getId() + "\"]");
        ans1.setIsCorrect(true);
        ans1.setMarksAwarded(2.0);
        ans1.setStatus("ANSWERED");
        ans1.setTimeSpentSeconds(4); // Trigger speed anomaly!
        attemptAnswerRepository.save(ans1);

        AttemptAnswerEntity ans2 = new AttemptAnswerEntity();
        ans2.setAttempt(attempt1);
        ans2.setQuestion(q2);
        ans2.setSelectedOptionIds("[\"" + q2.getOptions().get(0).getId() + "\"]"); // Wrong option
        ans2.setIsCorrect(false);
        ans2.setMarksAwarded(0.0);
        ans2.setStatus("ANSWERED");
        ans2.setTimeSpentSeconds(140);
        attemptAnswerRepository.save(ans2);

        // Aman Verma's attempt on DSA Sessional Paper I
        QuizAttemptEntity attempt2 = new QuizAttemptEntity();
        attempt2.setQuiz(quiz1);
        attempt2.setUser(student2);
        attempt2.setStatus("SUBMITTED");
        attempt2.setScore(1.0); // Got SEMAPHORES/q2 wrong, wait, quiz1 contains q1 and q2.
        // Let's seed answers matching quiz1 questions (q1, q2).
        attempt2.setStartedAt(LocalDateTime.now().minusMinutes(20));
        attempt2.setCompletedAt(LocalDateTime.now().minusMinutes(2));
        attempt2 = quizAttemptRepository.save(attempt2);

        AttemptAnswerEntity ans3 = new AttemptAnswerEntity();
        ans3.setAttempt(attempt2);
        ans3.setQuestion(q1);
        ans3.setSelectedOptionIds("[\"" + q1.getOptions().get(1).getId() + "\"]"); // Wrong
        ans3.setIsCorrect(false);
        ans3.setMarksAwarded(0.0);
        ans3.setStatus("ANSWERED");
        ans3.setTimeSpentSeconds(195);
        attemptAnswerRepository.save(ans3);

        AttemptAnswerEntity ans4 = new AttemptAnswerEntity();
        ans4.setAttempt(attempt2);
        ans4.setQuestion(q2);
        ans4.setSelectedOptionIds("[\"" + q2.getOptions().get(3).getId() + "\"]"); // Correct
        ans4.setIsCorrect(true);
        ans4.setMarksAwarded(1.0);
        ans4.setStatus("ANSWERED");
        ans4.setTimeSpentSeconds(65);
        attemptAnswerRepository.save(ans4);

        // Aman Verma's attempt on DBMS Remedial Patch Run
        QuizAttemptEntity attempt3 = new QuizAttemptEntity();
        attempt3.setQuiz(quiz2);
        attempt3.setUser(student2);
        attempt3.setStatus("SUBMITTED");
        attempt3.setScore(1.0); // Got q3 correct (+1), q4 wrong (+0)
        attempt3.setStartedAt(LocalDateTime.now().minusMinutes(15));
        attempt3.setCompletedAt(LocalDateTime.now().minusMinutes(5));
        attempt3 = quizAttemptRepository.save(attempt3);

        AttemptAnswerEntity ans5 = new AttemptAnswerEntity();
        ans5.setAttempt(attempt3);
        ans5.setQuestion(q3);
        ans5.setSelectedOptionIds("[\"" + q3.getOptions().get(0).getId() + "\"]"); // Correct
        ans5.setIsCorrect(true);
        ans5.setMarksAwarded(1.0);
        ans5.setStatus("ANSWERED");
        ans5.setTimeSpentSeconds(80);
        attemptAnswerRepository.save(ans5);

        AttemptAnswerEntity ans6 = new AttemptAnswerEntity();
        ans6.setAttempt(attempt3);
        ans6.setQuestion(q4);
        ans6.setSelectedOptionIds("[\"" + q4.getOptions().get(0).getId() + "\"]"); // Wrong
        ans6.setIsCorrect(false);
        ans6.setMarksAwarded(0.0);
        ans6.setStatus("ANSWERED");
        ans6.setTimeSpentSeconds(110);
        attemptAnswerRepository.save(ans6);

        System.out.println("Seeding completed successfully! Default teacher karl, students rahul and aman created.");
    }

    private QuestionEntity createQuestion(String publicId, String title, String text, 
                                          String type, String subject, String difficulty, 
                                          Double marks, UserEntity teacher,
                                          List<String> optionsText, int correctIdx) {
        QuestionEntity q = new QuestionEntity();
        q.setPublicId(publicId);
        q.setTitle(title);
        q.setQuestionText(text);
        q.setQuestionType(type);
        q.setSubject(subject);
        q.setDifficulty(difficulty);
        q.setStatus("APPROVED");
        q.setMarks(marks);
        q.setNegativeMarks(0.0);
        q.setCreatedBy(teacher);
        q.setMetadata("{\"explanation\":\"Detailed explanation for " + title + "\",\"unit\":3}");
        
        List<QuestionOptionEntity> opts = new ArrayList<>();
        for (int i = 0; i < optionsText.size(); i++) {
            QuestionOptionEntity opt = new QuestionOptionEntity();
            opt.setOptionText(optionsText.get(i));
            opt.setIsCorrect(i == correctIdx);
            opt.setQuestion(q);
            opts.add(opt);
        }
        q.setOptions(opts);
        return questionRepository.save(q);
    }
}
