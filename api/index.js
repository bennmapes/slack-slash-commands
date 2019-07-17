import { Router } from 'express';
import pullrequest from './pullrequest';

export default function() {
    let api = Router();

    api.use('/pullrequest', pullrequest);

    // perhaps expose some API metadata at the root
    api.get('/', (req, res) => {
        res.json({
            version : '1.0'
        });
    });

    return api;
}
