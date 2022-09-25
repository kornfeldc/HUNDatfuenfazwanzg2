var api = {
    url: "api",

    hash: "",

    get: (endpoint, p) => {
        return new Promise((resolve,reject) => {
            p = p||{};
            var user = storage.get("user");
            if(user) p.hash = user.hash;
            $.get({
                url: `${api.url}/${endpoint}.php`,
                data: p,
                success: (result) => {
                    console && console.log("api.get result", result);
                    resolve(result);
                }
            });
        });
    },

    set: (endpoint, p) => {
        return new Promise((resolve, reject) => {
            p = p||{};
            var user = storage.get("user");
            if(user) p.hash = user.hash;
            $.post({
                url: `${api.url}/${endpoint}.php`,
                data: p,
                success: (result) => {
                    console && console.log("api.set result", result);
                    resolve(result);
                }
            });
        });
    },

    login: (login, pw) => {
        return new Promise(resolve => {
            api.get("auth", { login: login, pw: pw }).then(result => {
                resolve(result);
            });
        });
    }
};
