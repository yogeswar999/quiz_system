-- Optional sample seed data. Run manually after schema.sql if you want demo content.
-- The default admin (admin / admin123) is auto-seeded by the app itself on first run,
-- so it is NOT included here.

USE quiz_db;

INSERT INTO quizzes (subject, duration, total_marks, number_of_questions, description) VALUES
('Java Basics', 15, 50, 5, 'Test your knowledge of Java fundamentals: variables, loops, OOP concepts.'),
('General Knowledge', 10, 40, 4, 'A quick general knowledge quiz covering geography, history, and science.');

INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_answer, marks, quiz_id) VALUES
('Which keyword is used to inherit a class in Java?', 'implements', 'extends', 'inherits', 'super', 'B', 10, 1),
('Which of these is NOT a primitive type in Java?', 'int', 'boolean', 'String', 'char', 'C', 10, 1),
('What is the default value of a boolean in Java?', 'true', 'false', '0', 'null', 'B', 10, 1),
('Which collection class allows duplicate elements?', 'Set', 'Map', 'List', 'None', 'C', 10, 1),
('What does JVM stand for?', 'Java Virtual Machine', 'Java Verified Method', 'Java Variable Module', 'Java Visual Machine', 'A', 10, 1),
('What is the capital of France?', 'Berlin', 'Madrid', 'Paris', 'Rome', 'C', 10, 2),
('Which planet is known as the Red Planet?', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'B', 10, 2),
('Who wrote the play "Romeo and Juliet"?', 'Charles Dickens', 'William Shakespeare', 'Mark Twain', 'Leo Tolstoy', 'B', 10, 2),
('What is the chemical symbol for water?', 'H2O', 'CO2', 'O2', 'NaCl', 'A', 10, 2);
