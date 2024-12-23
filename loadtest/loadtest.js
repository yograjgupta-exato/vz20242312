import { sleep, check } from "k6";
import http from "k6/http";
import { Counter, Trend } from 'k6/metrics';

const baseUrl = __ENV.API_URL
    ? `https://${__ENV.API_URL}`
    : `http://localhost:3000`
const endpoints = {
    serviceRequests: `${baseUrl}/api/service-requests`,
}


const SLEEP_DURATION = 1;//Math.random() * 5 + 5;
export const options = {
    stages: [
        { duration: "1m", target: 100 },
        { duration: "3m", target: 100 },
        { duration: "10m", target: 600 },
        { duration: "5m", target: 900 },
        { duration: "1m", target: 0 },
    ],
};
let CreateServiceRequestTrend = new Trend('Create Service Request');
let ErrorCount = new Counter("errors");


export default function () {
    let createServiceRequestRes = http.post(
        endpoints.serviceRequests,
        '{"expectedArrivalPeriod":{"end":"2030-07-19T04:11:04.647Z","start":"2030-07-19T04:11:04.647Z"},"customerAddress":{"building":"string","company":"string","city":"string","countryCode":"string","latitude":3.1068,"longitude":101.7259,"state":"string","street1":"string","street2":"string","postalCode":"56100","propertyType":"LANDED"},"customerContact":{"email":"cchitsiang@hotmail.com","name":"Chew Chit Siang","phone":"+60167228527","secondaryPhone":"+60167228527"},"customerOrder":{"remarks":"Wait me at guardhouse will bring up once you arrived","servicePackages":[{"id":"02921cd5-767a-4b86-8622-26ecb248af9d","quantity":1}],"total":0}}',
        {
            headers: {
                "accept-encoding": "gzip, deflate, br",
                "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                connection: "keep-alive",
                "content-type": "application/json",
                host: "api.daikinservishub.com",
                origin: baseUrl,
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                accept: "application/json",
                "sec-ch-ua":
                    '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                "sec-ch-ua-mobile": "?0",
                "x-otp-token": "999999",
            },
        }
    );

    const success = check(createServiceRequestRes, {
        "status is 201": r => r.status === 201
    });

    if (!success) {
        ErrorCount.add(1)
    }
    CreateServiceRequestTrend.add(createServiceRequestRes.timings.duration);

    sleep(SLEEP_DURATION);
}
