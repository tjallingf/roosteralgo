import _ from 'lodash';
import { Controller } from '../lib/ControllerFactory';
import Entity from '../models/Entity';
import fs from 'fs';



export default abstract class StableMarriageAlgo<TEntity extends Entity, TController extends Controller<TEntity>> {
    protected entities: TController;
    protected preferences: Record<string, string[]> = {};
    protected proposals: Record<string, string> = {};

    abstract fitness(x: TEntity, y: Entity): number;

    constructor(entities: TController) {
        this.entities = entities;

        this.entities.all().forEach(x => {
            const scores: Record<string, number> = {};

            this.entities.all().forEach(y => {                
                const fitness = this.fitness(x, y);
                if(fitness <= 0) return;

                scores[y.id] = fitness;
            })

            this.preferences[x.id] = _.orderBy(Object.keys(scores), id => scores[id], 'desc');
        })

        fs.writeFileSync('a.json', JSON.stringify(this.preferences), 'utf8');
    }

    getCouples() {
        const couples: [TEntity, TEntity][] = [];

        Object.entries(this.proposals).forEach(([ proposer, partner ]) => {
            if(!proposer || !partner) return;
            couples.push([ this.entities.get(proposer), this.entities.get(partner) ]);
        })

        return couples;
    }

    solve(): void {
        const preferences = {...this.preferences};

        // Initialize the engagement status and proposals
        const isEngaged: Record<string, boolean> = {};

        while (true) {
            // Find the first unengaged entity
            const proposer = Object.keys(preferences).find(student => !isEngaged[student])!;

            // Break if no unengaged proposer remains
            if(!proposer) break;

            // Get the preferred student from the proposer's list
            const partner = preferences[proposer][0];
            
            // If no potential partners for the proposer exist anymore (due to an incomplete preference list),
            // the proposer should be marked as engaged so it won't be checked again.
            if(!partner) {
                isEngaged[proposer] = true;
                continue;
            }

            // Remove the proposal from the recipient's list
            preferences[proposer] = preferences[proposer].slice(1);

            // If the recipient is not engaged, they accept the proposal
            if (!isEngaged[partner]) {
                isEngaged[proposer] = true;
                isEngaged[partner] = true;

                this.proposals[proposer] = partner;
                this.proposals[partner] = proposer;
                continue;
            }


            // If the recipient is engaged, check if they prefer the new proposer
            const currentPartner = this.proposals[partner][0];
            if (preferences[partner].indexOf(proposer) < preferences[partner].indexOf(currentPartner)) {
                isEngaged[currentPartner] = false;
                isEngaged[proposer] = true;

                this.proposals[proposer] = partner;
                this.proposals[partner] = proposer;
            }
        }
    }
}

