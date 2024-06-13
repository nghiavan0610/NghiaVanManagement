import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { Inject, Injectable } from '@nestjs/common';
import { proofs } from 'db/devData';
import { ProofRepository } from '../repositories/proof.repository';

@Injectable()
export class ProofSeeder {
    constructor(
        @Inject(ILoggerService) private readonly logger: ILoggerService,
        private readonly proofRepository: ProofRepository,
    ) {}

    async seedUp(): Promise<void> {
        this.logger.info('[PROOF SEEDING UP]');

        const processedProofs = proofs.map((proof: any) => {
            const processField = (key: string, value: any) => {
                if (value?.$oid) {
                    return value.$oid;
                }
                if (Array.isArray(value)) {
                    return value.map((item: any) => processField('', item));
                }
                if (value?.$date) {
                    return new Date(value.$date);
                }
                return value;
            };

            const processedProof: any = { ...proof };
            Object.keys(processedProof).forEach((key) => {
                processedProof[key] = processField(key, processedProof[key]);
            });
            return processedProof;
        });

        await this.proofRepository.insertMany(processedProofs);
    }

    async seedDown(): Promise<void> {
        this.logger.info('[PROOF SEEDING DOWN]');

        await this.proofRepository.collectionDrop();
    }
}
