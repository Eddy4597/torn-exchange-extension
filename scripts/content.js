const ENDPOINT = "https://www.tornexchange.com";

chrome.runtime.sendMessage({
    from: 'content',
    subject: 'showPageAction',
});

console.log("Running TE content.")

chrome.runtime.onMessage.addListener((msg) => {
    // First, validate the message's structure.
    if ((msg.from === 'popup') && (msg.subject === 'DOMInfo')) {
        // Collect the necessary data. 
        // (For your specific requirements `document.querySelectorAll(...)`
        //  should be equivalent to jquery's `$(...)`.)
        let trade = document.getElementById('trade-container')
        if (trade) {
            let userName = getUsernameFromTradePage();
            let sellerName = getSellerNameFromTradePage();
            let items = []
            let quantities = []

            const regex_splitter = /\sx(?=\d{1,10})/
            let trade_elements = document.querySelectorAll("#trade-container > div.trade-cont.m-top10 > div.user.right > ul > li > ul > li > div.name.left")

            for (let i = 0; i < trade_elements.length; i++) {

                // if string is not  '' or ' '
                if ((trade_elements[i].textContent) && (trade_elements[i].textContent.trim() !== '')) {

                    let textContent = trade_elements[i].textContent.split(regex_splitter);

                    if (textContent.length == 2) {
                        items.push(sanitizeItemName(textContent[0]));
                        quantities.push(parseInt(sanitizeItemName(textContent[1])));
                    }
                    else if (textContent.length == 1) {
                        const sanitized = sanitizeItemName(textContent[0]);
                        if (sanitized == "No items in trade") {
                            alert("No items in trade or trade already finished.");
                            throw new Error("No items in trade or trade already finished.");
                        }

                        items.push(sanitized);
                        quantities.push(1);
                    }
                }
            }

            if (quantities.length == 0) {
                alert("No items in trade!");
                throw new Error("No items in trade!");
            }

            responseData = getPricesFromPlayerApi(items, quantities, sellerName, userName);
        }

        // Directly respond to the sender (popup),
        // through the specified callback.
        return Promise.resolve(responseData)
    }
});

function getUsernameFromTradePage() {
    let username = document.querySelector("div.user.left > div > div").innerText;
    if (username == null) {
        document.querySelector("#sidebar > div:nth-child(1) > div > div > div > div > div > p > a").innerText;
    }
    return username;
}

function getSellerNameFromTradePage() {
    let sellername = document.querySelector("div.user.right > div ").innerText;
    sellername = sellername.replace('Hide item values', '');
    sellername = sellername.trim();
    return sellername;
}

function sanitizeItemName(itemName) {
    const TTregex = /\$.*/;
    let sanitized = itemName.replace(TTregex, '').trim().replaceAll('\n', '');
    return sanitized;

}


function getPricesFromPlayerApi(items, quantities, sellerName, userName) {
    var data = {
        "items": items,
        "quantities": quantities,
        "user_name": userName,
        "seller_name": sellerName
    }
   
    return data;
}
