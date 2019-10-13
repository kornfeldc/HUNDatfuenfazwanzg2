class Migration {

    constructor() {
        var user = storage.get("user");
        this.auth = user && user.hash;
    }

   execute(type) {
        var _this = this;
        return new Promise((resolve,reject) => {
            if(_this.auth) {
                $.getJSON("../nogit/migration/"+type+".json", function( data ) {
                    if(data && data.rows) {
                        if(type === "articles")
                            _this.saveArticles(data.rows).then(() => { resolve(); });
                        else if(type === "persons")
                            _this.savePersons(data.rows).then(() => { resolve(); });
                        else if(type === "sales")
                            _this.saveSales(data.rows).then(() => { resolve(); });
                    }
                });
            }
            else 
                reject();
        });
    }

    async saveArticles(data) {
        var _this = this;
        var articles = await Article.getList();
        console.log("existing articles", articles);
        for(var i = 0; i < data.length; i++) {
            var row = data[i];
            console.log("article",row);

            var foundArticle = articles.find(a => a.extId == row.doc._id);
            console.log("article found", foundArticle);
            var article = new Article();
            if(foundArticle) article.id = foundArticle.id; 
            article.extId = row.doc._id;
            article.title = row.doc.title;
            article.price = row.doc.price;
            article.type = row.doc.type;
            article.isFavorite = row.doc.isFavorite;
            await article.save();
        }
    }

    async savePersons(data) {
        var _this = this;
        var persons = await Person.getList();
        console.log("existing persons", persons);

        for(var i = 0; i < data.length; i++) {
            var row = data[i];
            console.log("person",row);

            var foundPerson = persons.find(p => p.extId == row.doc._id);
            console.log("person found", foundPerson);
            var person = new Person();
            if(foundPerson) person.id = foundPerson.id; 
            person.extId = row.doc._id;
            person.firstName = row.doc.firstName;
            person.lastName = row.doc.lastName;
            person.isMember = row.doc.isMember;
            person.personGroup = row.doc.personGroup;
            person.credit = row.doc.credit;

            await person.save();
        }
    }

    async saveSales(data) {
        var _this = this;
        var sales = await Sale.getList();
        var articles = await Article.getList();
        var persons = await Person.getList();

        for(var i = 0; i < data.length; i++) {
            var row = data[i];
            console.log("sale",row);
            
            var foundSale = sales.find(p => p.extId == row.doc._id);
            if(!foundSale) {
                var person = persons.find(p => p.extId === row.doc.person._id);
                if(row.doc.person._id === "bar") 
                    person = barPerson;
                console.log("found person", person);

                var sale = new Sale();
                sale.extId = row.doc._id;
                if(person) {
                    sale.personId = person.id;
                    sale.personName = person.nameWithGroup;
                }
                else {
                    //sales from deleted persons
                    sale.personId = -1;
                    sale.personName = row.doc.person.nameWithGroup + " (Person entfernt)";
                }

                sale.saleDate = moment(row.doc.saleDate, "DD.MM.YYYY HH:mm:ss").format(util.dateFormat);
                sale.articleSum = row.doc.articleSum || 0;
                sale.inclTip = row.doc.inclTip || 0;
                sale.given = row.doc.given || 0;
                sale.toPay = row.doc.toPay || 0;
                sale.toReturn = row.doc.toReturn || 0;
                sale.usedCredit = row.doc.usedCredit;
                sale.addAdditionalCredit = row.doc.addAdditionalCredit || 0;

                if(row.doc.payDate)
                    sale.payDate = moment(row.doc.payDate, "DD.MM.YYYY HH:mm:ss").format(util.dateFormat);
                await sale.save();
            }
        }

        sales = await Sale.getList();
        var saleArticles = await SaleArticle.getList();
        for(var i = 0; i < data.length; i++) {
            var row = data[i];
            var foundSale = sales.find(p => p.extId == row.doc._id);
            if(foundSale && row.doc.articles) {
                for(var j = 0; j < row.doc.articles.length; j++) {
                    var rowArticle = row.doc.articles[j];
                    var foundArticle = articles.find(a => a.extId === rowArticle.article._id);
                    if(foundArticle) {
                        var foundSaleArticle = saleArticles.find(sa => sa.saleId === foundSale.id && sa.articleId === foundArticle.id);
                        var saleArticle = new SaleArticle();
                        if(foundSaleArticle) saleArticles.id = foundSaleArticle.id;
                        saleArticle.articleId = foundArticle.id;
                        saleArticle.articleTitle = rowArticle.article.title;
                        saleArticle.articlePrice = rowArticle.article.price;
                        saleArticle.amount = rowArticle.amount;
                        saleArticle.saleId = foundSale.id;
                        await saleArticle.save({ blockCalculation: i < data.length-1 ? -1 : 0 });
                    }
                }
            }
        }
    }
}