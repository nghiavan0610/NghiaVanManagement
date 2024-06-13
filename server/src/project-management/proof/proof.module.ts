import { Module } from '@nestjs/common';
import { ProofServiceProvider } from './providers/proof-service.provider';
import { IProofService } from './services/proof-service.interface';
import { MongooseModule } from '@nestjs/mongoose';
import { Proof, ProofSchema } from './schemas/proof.schema';
import { ProofRepository } from './repositories/proof.repository';
import { ProofSeeder } from './seeders/proof.seeder';

@Module({
    imports: [MongooseModule.forFeature([{ name: Proof.name, schema: ProofSchema }])],
    providers: [ProofServiceProvider, ProofRepository, ProofSeeder],
    exports: [IProofService, ProofSeeder],
})
export class ProofModule {}
