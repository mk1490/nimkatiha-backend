import { Injectable } from '@nestjs/common';
import { BaseService } from '../../base/base-service';

@Injectable()
export class CoreService extends BaseService {


  async findCity(cityTitle) {
    if (cityTitle.length < 3)
      return [];
    return this.prisma.$queryRawUnsafe(`
        select providerValue                                  cityId,
               providerData                                   cityTitle,
               providerData_2                                 provinceId,
               (select providerData
                from baseData bdp
                where bdp.providerKey = 'province'
                  and bdp.providerValue = bdc.providerData_2) provinceTitle
        from baseData bdc
        where providerKey = 'city'
          and providerData like N'%${cityTitle}%';
    `);
  }


  get educationLevels() {
    return [
      { title: 'بی‌سواد', value: 1 },
      { title: 'پنجم ابتدایی', value: 2 },
      { title: 'سیکل', value: 3 },
      { title: 'دیپلم', value: 4 },
      { title: 'فوق دیپلم', value: 5 },
      { title: 'لیسانس', value: 6 },
      { title: 'فوق لیسانس', value: 7 },
      { title: 'دکتری', value: 8 },
      { title: 'حوزوی', value: 9 },
    ];
  }

  get lifeSituationItems() {
    return [
      { title: 'در قید حیات', value: 1 },
      { title: 'فوت شده', value: 2 },
    ];
  }


  get educationGrades() {
    return [
      { title: 'متوسطه اوّل', value: 1 },
      { title: 'متوسطه دوّم', value: 2 },
    ];
  }



  get schoolGrades() {
    return [
      { title: 'هفتم', value: 1 },
      { title: 'هشتم', value: 3 },
      { title: 'نهم', value: 3 },
      { title: 'دهم', value: 4 },
      { title: 'یازدهم', value: 5 },
    ];
  }


  get maritalStatus() {
    return [
      { title: 'مجرد', value: 1 },
      { title: 'متأهل', value: 2 },
      { title: 'متارکه', value: 3 },
      { title: 'فوت همسر', value: 4 },
    ];
  }


  get disabilityStatus() {
    return [
      { title: 'سالم', value: 1 },
      { title: 'دارای معلولیت', value: 2 },
    ];
  }


  get diseaseBackgroundItems() {
    return [
      { title: 'دارای سابقه بیماری', value: 1 },
      { title: 'بدون سابقه بیماری', value: 2 },
    ];
  }

  get singleChildItems() {
    return [
      { title: 'تک فرزند می‌باشم', value: 1 },
      { title: 'تک فرزند نمی‌باشم', value: 2 },
    ];
  }

  get religionItems() {
    return [
      { title: 'شیعه', value: 'شیعه' },
      { title: 'سنی', value: 'سنی' },
      { title: 'سایر', value: -1 },
    ];
  }


  get tarheVelayatItems() {
    return [
      { title: 'استانی', value: 1 },
      { title: 'حوزه‌ای', value: 2 },
    ];
  }


  get astaneQodsItems() {
    return [
      { title: 'بی‌نهایت شو', value: 1 },
      { title: 'برهان', value: 2 },
    ];
  }

  get oqafItems() {
    return [
      { title: 'ترتیل', value: 1 },
      { title: 'قرائت', value: 2 },
      { title: 'حفظ', value: 3 },
    ];
  }


  async cityItems() {
    const items = await this.prisma.cities.findMany();
    return items.map(f => {
      return {
        title: f.title,
        id: f.id,
      };
    });
  }


  get initializeItems() {
    return {
      disabilityStatus: this.disabilityStatus,
      maritalStatus: this.maritalStatus,
      educationLevels: this.educationLevels,
      diseaseBackgroundItems: this.diseaseBackgroundItems,
      lifeSituationItems: this.lifeSituationItems,
      educationGrades: this.educationGrades,
      schoolGrades: this.schoolGrades,
    };
  }

}
