class Article extends BaseModel {

    constructor() {
        super("article")
        this.id="_";
        this.title = "";
        this.type = "";
        this.price = 0.0;
        this.isFavorite = false;

        this.map = ["id","title", "type", "price", "isFavorite"];
    }

    static getTypes() {
        return [
            { id: "alcoholic", title: "Getränk - Alkoholisch", shortTitle: "Alk." },
            { id: "nonalcoholic", title: "Getränk - Antialkoholisch", shortTitle: "Antialk." },
            { id: "snack", title: "Snack", shortTitle: "Snacks" }
        ];
    }

    static getList() {
        return new Promise(resolve => {
            api.get("article").then(result => {
                resolve(this.fromArray(Article, result));
            });
        });
    }

    static get(id) {
        return super.get("article", Article, id);
    }

    static sort(articles, p) {
        return articles.sort((article1,article2) => {
            if(p.tab == "top") {
                var ac = 0, bc = 0;
                if(p.person && p.person.topArticleCounts && p.person.topArticleCounts[article1.id])
                    ac = p.person.topArticleCounts[article1.id];
                if(p.person && p.person.topArticleCounts && p.person.topArticleCounts[article2.id])
                    bc = person.topArticleCounts[article2.id];
                return ac > bc ? -1 : ac < bc ? 1 : 0;
            }
            else {
                var sortProperty = "title";
                return article1[sortProperty] < article2[sortProperty] ? -1 : article1[sortProperty] > article2[sortProperty] ? 1 : 0;
            }
        });
    }

    static getFiltered(articles, p) {

        //todo: p.person

        var ret = articles.filter(article => {
            var x = true;

            //filter by tab
            if(p.tab) 
                x = x && (
                    (p.tab === "favorites" && article.isFavorite === 1) || 
                    (p.tab === "top" && p.person && p.person.topArticleCounts && p.person.topArticleCounts[article.id] && p.person.topArticleCounts[article.id] > 0) ||
                    article.type === p.tab
                );
            x = x && util.search(article.title, p.search);
            return x;
        });

        return this.sort(ret, p);
    }
}