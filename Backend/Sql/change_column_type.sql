drop table if exists scientist;
create table scientist (id integer, firstname varchar(10), lastname varchar(10));
insert into scientist (id, firstname, lastname) values (1, 'albert', '{"a":"b"}');
insert into scientist (id, firstname, lastname) values (2, 'isaac', '{"a":"b"}');
insert into scientist (id, firstname, lastname) values (3, 'marie', '{"a":"b"}');


ALTER TABLE scientist ADD COLUMN lastname2 jsonb default null;
UPDATE scientist SET lastname2 = to_json(lastname::text);

ALTER TABLE scientist RENAME COLUMN lastname TO lastname_old;
ALTER TABLE scientist RENAME COLUMN lastname2 TO lastname;
ALTER TABLE scientist DROP COLUMN lastname_old;

select * from scientist;
