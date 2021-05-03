const axios = require('axios').default;
const to = require('await-to-js').default;

// es6
// import axios from 'axios';
// import to from 'await-to-js';

let Postcode = {
  getAddressByPostcode: async function (zipcode) {
    let url = 'https://developers.onemap.sg/commonapi/search';
    let params = {
      searchVal: zipcode,
      returnGeom: 'N',
      getAddrDetails: 'Y',
      pageNum: '1'
    };
    // get address by OneMap REST APIs -- https://docs.onemap.sg/#search
    let [err, response] = await to(axios.get(url, {params}));
    if (err) return {error: err};
    
    let json = response.data;
    if (json) {
      if (json.error) return json;

      if (json.found) {
        let {BLK_NO, ROAD_NAME, POSTAL} = json.results[0];
        let res = {BLK_NO, ROAD_NAME, POSTAL};
        res.address = json.results.map(item => {
          let {BUILDING, ADDRESS} = item;
          BUILDING = BUILDING ? BUILDING.replace(/NIL/, '') : ''
          return {BUILDING, ADDRESS};
        });

        return res;
      }

      return {error: `Not found address from postcode:${zipcode}`};
    }

    return {error: 'Not found data response!'};
  }
};

module.exports = Postcode;