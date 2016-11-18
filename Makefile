DBUSER ?=  $(shell bash -c 'read -p "DB-User: " dbuser;echo $$dbuser')
.PHONY: install
install:
	@npm install
	@mysql -u $(DBUSER) -p < ./oxie.sql