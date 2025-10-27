import { Module } from '@nestjs/common';
import { LudoGateway } from './ludo/ludo.gateway';
// import { LudoService } from './ludo/ludo.service';

@Module({
  imports: [],
  controllers: [],
  providers: [LudoGateway],
})
export class AppModule {}
