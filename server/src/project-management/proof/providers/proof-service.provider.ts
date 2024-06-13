import { Provider } from '@nestjs/common';
import { IProofService } from '../services/proof-service.interface';
import { ProofService } from '../services/proof.service';

export const ProofServiceProvider: Provider = {
    provide: IProofService,
    useClass: ProofService,
};
