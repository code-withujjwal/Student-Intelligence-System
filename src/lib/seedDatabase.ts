import { supabase } from './supabaseClient';

/**
 * Seeds the Supabase database with an initial quiz and associated questions.
 * This is a temporary script meant for initial data population.
 */
export async function seedInitialQuizzes() {
  console.log('Initiating database seed process...');

  try {
    // 1. Insert a sample quiz into the 'quizzes' table
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .insert([
        {
          title: 'Java Fundamentals',
          category: 'Java',
          difficulty: 'medium',
          time_limit_secs: 600 // 10 minutes in seconds
        }
      ])
      .select()
      .single();

    if (quizError) {
      console.error('Error inserting quiz:', quizError.message);
      return;
    }

    console.log(`Successfully created quiz: "${quizData.title}" (ID: ${quizData.id})`);
    
    const quizId = quizData.id;

    // 2. Insert 3 structural questions matching the new quiz ID
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .insert([
        {
          quiz_id: quizId,
          question_text: 'Which of the following is NOT a core feature of the Java programming language?',
          options: [
            'Object-oriented',
            'Platform-independent',
            'Use of explicit pointers',
            'Robust'
          ],
          correct_option_idx: 2
        },
        {
          quiz_id: quizId,
          question_text: 'What is the default value of a local variable in Java?',
          options: [
            'null',
            '0',
            'Depends on the data type',
            'No default value; must be initialized'
          ],
          correct_option_idx: 3
        },
        {
          quiz_id: quizId,
          question_text: 'Which memory concept does Java use to automatically reclaim memory from objects that are no longer referenced?',
          options: [
            'Memory Leaking',
            'Garbage Collection',
            'Manual Deallocation',
            'Heap Flushing'
          ],
          correct_option_idx: 1
        }
      ])
      .select();

    if (questionsError) {
      console.error('Error inserting questions:', questionsError.message);
      return;
    }

    console.log(`Successfully inserted ${questionsData?.length || 0} questions for the quiz.`);
    console.log('Database seeding complete! ✅');

  } catch (err) {
    console.error('Unexpected error during seeding:', err);
  }
}
