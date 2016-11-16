DBHOST ?=  $(shell bash -c 'read -p "DB-Host: " host;echo $$host')
DBUSER ?=  $(shell bash -c 'read -p "DB-User: " dbuser;echo $$dbuser')
PASSWORD ?=  $(shell bash -c 'read -s -p "Password: " pwd;echo $$pwd')
DBLOC := ./modals/db.js
.PHONY: install
install:
	@npm install
	@rm -f $(DBLOC)
	@echo "var mysql = require('mysql');\n" > $(DBLOC)
	@echo "var pool = mysql.createPool({" >> $(DBLOC)
	@echo "\thost: '$(DBHOST)'," >> $(DBLOC)
	@echo "\tuser: '$(DBUSER)'," >> $(DBLOC)
	@echo "\tpassword: '$(PASSWORD)'," >> $(DBLOC)
	@echo "\tdatabase: 'oxie'" >> $(DBLOC)
	@echo "});\n" >> $(DBLOC)
	@echo "exports.pool = pool;" >> $(DBLOC)
	@mysql -u $(DBUSER) -p < ./oxie.sql