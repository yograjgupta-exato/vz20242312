import { ServiceAreaType } from '@shared/enums/service-area-type';

const fs = require('fs');

export const serviceAreas = [
    {
        name: 'Cheras',
        geom: JSON.parse(fs.readFileSync(__dirname + '/cheras.geojson')),
        type: ServiceAreaType.District,
        isWithinCoverage: true,
    },
    {
        name: 'Kuala Lumpur',
        geom: JSON.parse(fs.readFileSync(__dirname + '/kuala-lumpur.geojson')),
        type: ServiceAreaType.FederalTerritory,
        isWithinCoverage: true,
    },
    {
        name: 'Selangor',
        geom: JSON.parse(fs.readFileSync(__dirname + '/selangor.geojson')),
        type: ServiceAreaType.State,
        isWithinCoverage: true,
    },
    {
        name: 'Johor',
        geom: JSON.parse(fs.readFileSync(__dirname + '/johor.geojson')),
        type: ServiceAreaType.State,
        isWithinCoverage: false,
    },
    {
        name: 'Penang',
        geom: JSON.parse(fs.readFileSync(__dirname + '/penang.geojson')),
        type: ServiceAreaType.State,
        isWithinCoverage: false,
    },
    {
        name: 'Perak',
        geom: JSON.parse(fs.readFileSync(__dirname + '/perak.geojson')),
        type: ServiceAreaType.State,
        isWithinCoverage: false,
    },
    {
        name: 'Kedah',
        geom: JSON.parse(fs.readFileSync(__dirname + '/kedah.geojson')),
        type: ServiceAreaType.State,
        isWithinCoverage: false,
    },
    {
        name: 'Perlis',
        geom: JSON.parse(fs.readFileSync(__dirname + '/perlis.geojson')),
        type: ServiceAreaType.State,
        isWithinCoverage: false,
    },
    {
        name: 'Kelantan',
        geom: JSON.parse(fs.readFileSync(__dirname + '/kelantan.geojson')),
        type: ServiceAreaType.State,
        isWithinCoverage: false,
    },
    {
        name: 'Pahang',
        geom: JSON.parse(fs.readFileSync(__dirname + '/pahang.geojson')),
        type: ServiceAreaType.State,
        isWithinCoverage: false,
    },
    {
        name: 'Melacca',
        geom: JSON.parse(fs.readFileSync(__dirname + '/melacca.geojson')),
        type: ServiceAreaType.State,
        isWithinCoverage: false,
    },
    {
        name: 'Negeri Sembilan',
        geom: JSON.parse(fs.readFileSync(__dirname + '/negeri-sembilan.geojson')),
        type: ServiceAreaType.State,
        isWithinCoverage: false,
    },
    {
        name: 'Terengganu',
        geom: JSON.parse(fs.readFileSync(__dirname + '/terengganu.geojson')),
        type: ServiceAreaType.State,
        isWithinCoverage: false,
    },
    {
        name: 'Sabah',
        geom: JSON.parse(fs.readFileSync(__dirname + '/sabah.geojson')),
        type: ServiceAreaType.State,
        isWithinCoverage: false,
    },
    {
        name: 'Sarawak',
        geom: JSON.parse(fs.readFileSync(__dirname + '/sarawak.geojson')),
        type: ServiceAreaType.State,
        isWithinCoverage: false,
    },
];
