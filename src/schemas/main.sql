CREATE TABLE IF NOT EXISTS test (id PRIMARY KEY, date TEXT, status TEXT);
SELECT crsql_as_crr('test');
