import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { Public } from '../common/decorators/public.decorator';
import { SearchResultDto } from './dtos/search-response.dto';
import { SearchQueryDto } from './dtos/search-query.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @ApiOkResponse({ type: [SearchResultDto] })
  @Get()
  search(@Query() query: SearchQueryDto): Promise<SearchResultDto[]> {
    return this.searchService.search(query);
  }
}
