DBHOST ?=  $(shell bash -c 'read -p "DB-Host: " host;echo $$host')
.PHONY: install
install:
	@npm install
	@mysql -u $(DBUSER) -p < ./oxie.sql