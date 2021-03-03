const https = require('https');
const fs = require('fs');

const minutes_between_info_refesh = 10;
const interval_between_info_refresh = minutes_between_info_refesh * 60 * 1000;

const itemIDs = [1935, 1033, 314 , 1511, 1513, 1515, 1517, 1519, 1521, 1381, 1387, 1925, 1511, 1513, 1515, 1517, 1519, 1521, 436 , 438 , 440 , 442 , 444 , 447 , 449 , 451, 2349, 2351, 2353, 2355, 2357, 2359, 2361, 2363, 554 , 555 , 556 , 559 , 560 , 561 , 563 , 564 , 1436, 7936, 1033, 1035, 245 , 2653, 2655, 2657, 2659, 3478, 2669, 2671, 2673, 2675, 3480, 2661, 2663, 2665, 2667, 3479, 542 , 544 , 1033, 1035, 577 , 581 , 7390, 7394 , 7392, 7396 , 12449 , 12451];
//const itemIDs = [314];

update_ge_prices();
setInterval(() => {
	update_ge_prices();
}, interval_between_info_refresh);

function update_ge_prices() {
    const request_interval = 10000;
    itemIDs.forEach(itemID => {
        let date = new Date();
	    let timestamp = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        let folder = `./database/osrs/${itemID}`
        let total_request_interval =+ request_interval;

        fs.mkdir(folder, (error) => {
            if (error && error.code !== 'EEXIST') {
                console.log(error);
            }
        });

        fs.exists(folder + '/' + timestamp + '.json', (present) => {
            console.log(present);
            if (!present) {
                setTimeout(() => {
                    make_rs_get_request(itemID, true)
                    .then((data) => {
                        if (data.startsWith('{')) {
                            write_to_file(folder, timestamp, data);
                        } else {
                            console.log(data);
                        }
                    })
                }, total_request_interval);
            }
        }) 
    })
}

function write_to_file(folder, timestamp, data) {
    fs.writeFile(folder + '/' + timestamp + '.json', data, (error) => {
        if (error) {
            if (error.code !== 'EEXIST') {
                console.log(error);
            }
        }
    });
}

function make_rs_get_request(item_id, version_osrs) {
	let rs_url;

	if (version_osrs) {
		//rs_url = 'https://services.runescape.com/m=itemdb_oldschool/api/catalogue/detail.json?item=' + item_id;
		rs_url = 'https://secure.runescape.com/m=itemdb_oldschool/api/catalogue/detail.json?item=' + item_id;
	} else {
		rs_url = 'https://secure.runescape.com/m=itemdb_rs/api/catalogue/detail.json?item=' + item_id;
	}
	return new Promise((resolve, reject) => {
		const req = https.get(rs_url, (res) => {
			let data = '';

			if (res.statusCode != 200) {
                console.log(res.statusCode);
                console.log(item_id);
				reject('offline0');
			}
			res.on('data', (chunk) => {
				data += chunk;
			})

			res.on('end', () => {
				if (res.statusCode != 200) {
					console.log(res.statusCode);
					reject('offline0');
				}
				if (data.length !== 0) {
					resolve(data);
				} else {
					reject('no data');
				}
			});
		});
		req.on('error', error => {
			console.error(`Error message 1\n ${error}`);
			reject('offline1');
		});
		req.end();
	});
}