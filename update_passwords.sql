-- Update passwords to plain text
UPDATE Users
SET Password = 'mypassword'
WHERE Username = 'testuserw2312' OR Username = 'testuserw980';

UPDATE Users
SET Password = 'Adityan'
WHERE Username = 'Educator';

UPDATE Users
SET Password = 'test'
WHERE Email = 'adiya@gmail.com';

UPDATE Users
SET Password = 'test'
WHERE Username = 'testuser'; 