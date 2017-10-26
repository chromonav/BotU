## Primary Key - Foreign Key.
sid pid combination is a primary key.

## Trigger

## Joins
select p.*,s.* from products p right join store_products sp on sp.pid = p.pid right join stores s on s.sid = sp.sid;
## NF chya goshti
