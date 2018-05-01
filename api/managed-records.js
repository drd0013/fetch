import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

// Your retrieve function plus any additional functions go here ...

let PRIMARY_COLORS = ['red', 'blue', 'yellow'];

function parseRow(row, parsedDataDict) {
    parsedDataDict.ids.push(row.id);
    row.isPrimary = PRIMARY_COLORS.includes(row.color);
    if (row.isPrimary && row.disposition === 'closed') {
        parsedDataDict.closedPrimaryCount +=1
    }
    if (row.disposition === 'open') {
        parsedDataDict.open.push(row)
    }
}

function parseData(responseData, url) {
    let previousPage = null;
    let nextPage = null;
    let currentPage = 1;

    let urlParamMap = url.search(true);
    if (urlParamMap.offset) {
        currentPage = parseInt(urlParamMap.offset) / 10 + 1
    }

    if (currentPage > 1) {
        previousPage = currentPage - 1
    }
    if (responseData.length === 11) {
        nextPage = currentPage + 1
    }
    let parsedData = {
        'ids': [],
        'open': [],
        'closedPrimaryCount': 0,
        'previousPage': previousPage,
        'nextPage': nextPage,
    };

    // only parse up to 10 items.
    let rowsToParse = responseData.slice(0, 10);
    rowsToParse.forEach((row) => {
        parseRow(row, parsedData)
    });

    return parsedData
}

function fetchData(url) {
    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                console.log('An error occurred');
                return []
            }
            return response.json()
        })
        .then((responseData) => {
            return parseData(responseData, url)
        })
}

function retrieve(props) {
    let page, colors;
    if (props) {
        page = props.page;
        colors = props.colors
    }

    let url = URI(window.path);

    // request 11 to know whether there is more data or not
    url.addSearch('limit', 11);
    if (page) {
        url.addSearch('offset', (page - 1) * 10)
    } else {
        url.addSearch('offset', 0)
    }

    if (colors) {
        url.addSearch({'color[]': colors})
    }

    return new Promise((resolve) => {
        resolve(fetchData(url))
    })
}

export default retrieve;
