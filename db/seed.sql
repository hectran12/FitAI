-- FitAI Exercise Seed Data
-- 30+ exercises covering all equipment levels and muscle groups

-- Clear existing exercises
DELETE FROM exercises;

-- Bodyweight exercises (equipment: none)
INSERT INTO exercises (name, muscle_group, equipment, difficulty, description, instructions) VALUES
('Chống đẩy', 'chest', 'none', 'beginner', 'Bài tập ngực cơ bản', 'Bắt đầu ở tư thế plank, hạ ngực xuống sàn, đẩy người lên. Giữ core siết chặt và thân thẳng.'),
('Chống đẩy rộng tay', 'chest', 'none', 'beginner', 'Biến thể chống đẩy tập ngực ngoài', 'Thực hiện chống đẩy với tay đặt rộng hơn vai.'),
('Chống đẩy kim cương', 'triceps', 'none', 'intermediate', 'Biến thể chống đẩy tập tay sau', 'Tạo hình kim cương với hai tay dưới ngực. Hạ xuống và đẩy lên.'),
('Chống đẩy Pike', 'shoulders', 'none', 'intermediate', 'Biến thể chống đẩy tập vai', 'Bắt đầu ở tư thế chó cúi đầu, gập khuỷu tay hạ đầu xuống sàn.'),
('Squat không tạ', 'legs', 'none', 'beginner', 'Bài tập chân cơ bản', 'Đứng chân rộng bằng vai, hạ hông xuống và ra sau, giữ ngực thẳng.'),
('Squat nhảy', 'legs', 'none', 'intermediate', 'Biến thể squat bùng nổ', 'Thực hiện squat, sau đó nhảy lên mạnh mẽ. Tiếp đất nhẹ nhàng và lặp lại.'),
('Chùng chân', 'legs', 'none', 'beginner', 'Bài tập chân đơn lẻ', 'Bước chân về trước, hạ đầu gối sau xuống gần sàn, đẩy về vị trí ban đầu.'),
('Chùng chân di chuyển', 'legs', 'none', 'intermediate', 'Biến thể chùng chân động', 'Thực hiện chùng chân xen kẽ trong khi di chuyển về phía trước.'),
('Squat Bulgaria', 'legs', 'none', 'intermediate', 'Bài tập chân đơn nâng cao', 'Chân sau đặt trên ghế, hạ xuống tư thế squat một chân.'),
('Nâng hông', 'legs', 'none', 'beginner', 'Kích hoạt mông và gân kheo', 'Nằm ngửa, gập đầu gối, nâng hông lên trần siết chặt mông.'),
('Nâng hông một chân', 'legs', 'none', 'intermediate', 'Bài tập mông đơn bên', 'Thực hiện nâng hông với một chân duỗi thẳng.'),
('Plank', 'core', 'none', 'beginner', 'Bài tập ổn định core', 'Giữ tư thế chống đẩy trên cẳng tay, giữ thân thẳng. Giữ theo thời gian.'),
('Plank nghiêng', 'core', 'none', 'intermediate', 'Bài tập core tập trung bên hông', 'Cân bằng trên một cẳng tay và cạnh bàn chân, giữ thân thẳng.'),
('Leo núi', 'core', 'none', 'intermediate', 'Bài tập core động và cardio', 'Ở tư thế plank, xen kẽ đưa đầu gối về phía ngực nhanh chóng.'),
('Gập bụng xe đạp', 'core', 'none', 'beginner', 'Bài tập core xoay người', 'Nằm ngửa, xen kẽ khuỷu tay chạm đầu gối đối diện như đạp xe.'),
('Nâng chân', 'core', 'none', 'intermediate', 'Bài tập bụng dưới', 'Nằm ngửa, nâng chân thẳng lên 90 độ, hạ xuống có kiểm soát.'),
('Burpees', 'full_body', 'none', 'intermediate', 'Bài tập toàn thân', 'Hạ xuống chống đẩy, thực hiện chống đẩy, nhảy chân về tay, nhảy lên với tay giơ cao.'),
('Siêu nhân', 'back', 'none', 'beginner', 'Tăng cường lưng dưới', 'Nằm sấp, nâng tay và chân khỏi mặt đất, giữ ngắn.'),
('Chèo thuyền ngược', 'back', 'none', 'intermediate', 'Chèo thuyền bằng trọng lượng cơ thể dùng bàn hoặc xà', 'Treo dưới xà hoặc bàn, kéo ngực lên xà giữ thân thẳng.'),
('Đẩy tay sau ghế', 'triceps', 'none', 'beginner', 'Bài tập tay sau dùng ghế', 'Tay đặt trên mép ghế, hạ người bằng cách gập khuỷu tay, đẩy lên.'),
('Nhảy sao', 'cardio', 'none', 'beginner', 'Bài tập cardio cổ điển', 'Nhảy chân ra ngoài đồng thời giơ tay lên đầu, trở về vị trí ban đầu.'),
('Chạy nâng gối cao', 'cardio', 'none', 'beginner', 'Chạy tại chỗ nâng gối cao', 'Chạy tại chỗ, đưa đầu gối lên ngang hông.'),

-- Home equipment exercises (dumbbells, resistance bands)
('Đẩy ngực tạ đơn', 'chest', 'home', 'beginner', 'Đẩy ngực nằm với tạ đơn', 'Nằm trên sàn hoặc ghế, đẩy tạ lên từ ngực, hạ có kiểm soát.'),
('Bay ngực tạ đơn', 'chest', 'home', 'intermediate', 'Bài tập cô lập ngực', 'Nằm trên ghế, tay duỗi với khuỷu hơi cong, hạ tạ ra hai bên.'),
('Chèo thuyền tạ đơn', 'back', 'home', 'beginner', 'Bài tập lưng một tay', 'Một tay và đầu gối trên ghế, kéo tạ về hông, siết lưng.'),
('Đẩy vai tạ đơn', 'shoulders', 'home', 'beginner', 'Động tác đẩy qua đầu', 'Ngồi hoặc đứng, đẩy tạ từ vai lên qua đầu.'),
('Nâng tạ ngang vai', 'shoulders', 'home', 'beginner', 'Bài tập cô lập vai', 'Tay xuôi hai bên, nâng tạ ra ngang vai.'),
('Nâng tạ trước vai', 'shoulders', 'home', 'beginner', 'Cô lập vai trước', 'Nâng tạ phía trước lên ngang vai.'),
('Cuốn tay tạ đơn', 'biceps', 'home', 'beginner', 'Bài tập tay trước cổ điển', 'Cuốn tạ từ đùi lên vai, siết ở đỉnh.'),
('Cuốn tay búa', 'biceps', 'home', 'beginner', 'Cuốn tay grip trung tính', 'Cuốn tạ với lòng bàn tay hướng vào nhau.'),
('Duỗi tay sau tạ đơn', 'triceps', 'home', 'beginner', 'Bài tập tay sau qua đầu', 'Giữ tạ qua đầu, hạ ra sau đầu bằng cách gập khuỷu tay.'),
('Đá tay sau', 'triceps', 'home', 'beginner', 'Bài tập cô lập tay sau', 'Cúi người, duỗi tay thẳng ra sau, siết tay sau.'),
('Squat Goblet', 'legs', 'home', 'beginner', 'Biến thể squat có tạ', 'Giữ tạ trước ngực, squat với thân thẳng đứng.'),
('Deadlift Romania tạ đơn', 'legs', 'home', 'intermediate', 'Tập trung gân kheo và mông', 'Gập hông, hạ tạ dọc chân, cảm nhận căng gân kheo.'),
('Chùng chân tạ đơn', 'legs', 'home', 'intermediate', 'Biến thể chùng chân có tạ', 'Cầm tạ hai bên, thực hiện chùng chân di chuyển hoặc tại chỗ.'),
('Bước lên bậc tạ đơn', 'legs', 'home', 'intermediate', 'Bài tập một chân có tạ', 'Bước lên bề mặt nâng cao cầm tạ.'),
('Kéo dây kháng lực', 'back', 'home', 'beginner', 'Bài tập lưng trên và vai sau', 'Giữ dây phía trước, kéo ra bằng cách siết xương bả vai.'),
('Chèo thuyền dây kháng lực', 'back', 'home', 'beginner', 'Động tác chèo có dây', 'Cố định dây, kéo về người siết cơ lưng.'),

-- Gym equipment exercises (barbells, machines, cables)
('Đẩy ngực tạ đòn', 'chest', 'gym', 'intermediate', 'Bài tập ngực compound chính', 'Nằm trên ghế, hạ tạ xuống ngực, đẩy lên. Dùng người hỗ trợ khi tập nặng.'),
('Đẩy ngực nghiêng', 'chest', 'gym', 'intermediate', 'Tập trung ngực trên', 'Ghế nghiêng 30-45 độ, đẩy tạ từ ngực trên.'),
('Cáp bay ngực', 'chest', 'gym', 'intermediate', 'Cô lập ngực dùng cáp', 'Đứng giữa hai cáp, đưa tay nắm về phía trước ngực.'),
('Kéo xà', 'back', 'gym', 'beginner', 'Bài tập kéo dọc', 'Kéo xà xuống ngực trên, siết lưng, kiểm soát khi thả.'),
('Chèo thuyền cáp ngồi', 'back', 'gym', 'beginner', 'Bài tập kéo ngang', 'Kéo tay nắm về ngực dưới, siết xương bả vai.'),
('Chèo thuyền tạ đòn', 'back', 'gym', 'intermediate', 'Bài tập lưng compound', 'Cúi người, kéo tạ về ngực dưới/bụng trên.'),
('Hít xà', 'back', 'gym', 'intermediate', 'Kéo dọc bằng trọng lượng cơ thể', 'Treo trên xà, kéo cằm qua xà, hạ có kiểm soát.'),
('Đẩy vai tạ đòn đứng', 'shoulders', 'gym', 'intermediate', 'Đẩy vai qua đầu đứng', 'Đẩy tạ từ vai trước lên khóa qua đầu.'),
('Kéo cáp mặt', 'shoulders', 'gym', 'beginner', 'Bài tập vai sau và rotator cuff', 'Kéo dây về ngang mặt, kéo ra ở cuối.'),
('Cuốn tay tạ đòn', 'biceps', 'gym', 'intermediate', 'Bài tập tay trước tạ đòn cổ điển', 'Cuốn tạ từ đùi lên vai với form chuẩn.'),
('Cuốn tay Preacher', 'biceps', 'gym', 'intermediate', 'Cuốn tay cô lập trên ghế preacher', 'Tay trên đệm, cuốn tạ tập trung co tay trước.'),
('Đẩy tay sau cáp', 'triceps', 'gym', 'beginner', 'Cô lập tay sau trên cáp', 'Đẩy cáp xuống, duỗi tay hoàn toàn, siết tay sau.'),
('Skull Crushers', 'triceps', 'gym', 'intermediate', 'Duỗi tay sau nằm', 'Nằm trên ghế, hạ tạ về phía trán, duỗi tay.'),
('Squat tạ đòn', 'legs', 'gym', 'intermediate', 'Bài tập chân compound cơ bản', 'Tạ trên lưng trên, squat xuống song song hoặc thấp hơn, đẩy lên.'),
('Đẩy chân máy', 'legs', 'gym', 'beginner', 'Bài tập chân trên máy', 'Đẩy bàn đạp ra bằng cách duỗi chân, kiểm soát khi hạ.'),
('Deadlift Romania', 'legs', 'gym', 'intermediate', 'Bài tập gân kheo tạ đòn', 'Gập hông với đầu gối hơi cong, cảm nhận căng gân kheo.'),
('Cuốn gân kheo máy', 'legs', 'gym', 'beginner', 'Máy cô lập gân kheo', 'Cuốn tạ về mông, siết gân kheo.'),
('Duỗi chân máy', 'legs', 'gym', 'beginner', 'Máy cô lập đùi trước', 'Duỗi chân thẳng đầu gối, kiểm soát khi hạ.'),
('Nâng bắp chân', 'legs', 'gym', 'beginner', 'Bài tập bắp chân đứng', 'Nhón lên mũi chân, hạ gót xuống dưới bàn đạp.'),
('Gập bụng cáp', 'core', 'gym', 'intermediate', 'Bài tập core có tạ', 'Quỳ hướng cáp, gập người xuống kéo tạ bằng bụng.'),
('Nâng chân treo xà', 'core', 'gym', 'advanced', 'Bài tập core nâng cao', 'Treo trên xà, nâng chân lên song song hoặc cao hơn.');


-- Note: User data is not seeded here to avoid duplicates
-- Use registration to create users
