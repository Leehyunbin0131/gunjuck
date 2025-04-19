/**
 * 장병내일준비적금 계산기 (Military Future Preparation Savings Calculator)
 * 
 * MVC 패턴을 적용한 모듈화된 코드 구조
 * - Model: 데이터 및 계산 로직
 * - View: UI 업데이트 및 렌더링
 * - Controller: 이벤트 핸들링 및 Model/View 연결
 */

// 즉시실행함수를 통한 네임스페이스 관리 및 캡슐화
(function() {
  'use strict';

  /**
   * MODEL: 데이터 및 계산 로직
   */
  const CalculatorModel = {
    // 상수 데이터
    constants: {
      // 연도별 매칭 정보 (비율, 최대 납입액)
      matchInfo: {
        2022: { matchPercent: 0.33, maxDeposit: 400000 },
        2023: { matchPercent: 0.71, maxDeposit: 400000 },
        2024: { matchPercent: 1.0 , maxDeposit: 400000 },
        2025: { matchPercent: 1.0 , maxDeposit: 550000 }
      },
      
      // 군종별 복무 개월
      serviceMonths: {
        army: 18,
        navy: 20,
        airforce: 21,
        marine: 18  // 추가: 해병대
      },
      
      // 이자율 (5%)
      interestRate: 0.05
    },
    
    // 현재 계산 데이터
    data: {
      startDate: null,
      branch: '',
      deposits: {
        2022: 0,
        2023: 0,
        2024: 0,
        2025: 0
      },
      
      // 계산 결과
      results: {
        totalMonths: 0,
        totalDeposit: 0,
        totalMatched: 0,
        interest: 0,
        finalTotal: 0,
        monthlyDetails: []
      }
    },
    
    /**
 * 입력 데이터 설정 및 검증 - 만원 단위 입력을 처리하도록 수정
 * @param {Object} inputData 사용자 입력 데이터
 * @returns {Boolean} 검증 결과
 */
setInputData(inputData) {
  try {
    // 필수 입력값 검증
    if (!inputData.startDate || !inputData.branch) {
      console.log('필수 입력값 누락: ', inputData);
      return false;
    }
    
    // 데이터 설정 - 만원 단위 입력을 원 단위로 변환 (× 10000)
    this.data.startDate = new Date(inputData.startDate);
    this.data.branch = inputData.branch;
    this.data.deposits = {
      2022: Number(inputData.deposits[2022]) * 10000 || 0,
      2023: Number(inputData.deposits[2023]) * 10000 || 0,
      2024: Number(inputData.deposits[2024]) * 10000 || 0,
      2025: Number(inputData.deposits[2025]) * 10000 || 0
    };
    
    console.log('입력 데이터 설정 완료: ', this.data);
    return true;
  } catch (error) {
    console.error('입력 데이터 설정 오류: ', error);
    return false;
  }
},

/**
 * 저축액 계산 실행 - 전역월까지 포함하도록 수정
 * @returns {Object} 계산 결과
 */
calculate() {
  try {
    // 변수 초기화
    const results = {
      totalMonths: 0,
      totalDeposit: 0,
      totalMatched: 0,
      interest: 0,
      finalTotal: 0,
      monthlyDetails: []
    };
    
    // 복무 기간 계산
    const startDate = new Date(this.data.startDate);
    const totalMonths = this.constants.serviceMonths[this.data.branch];
    
    // 전역일 계산 - 복무 개월 수 추가
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + totalMonths);
    
    // 전역일이 포함된 월의 마지막 날로 설정 (전역월까지 포함)
    const lastDayOfDischargeMonth = new Date(
      endDate.getFullYear(),
      endDate.getMonth() + 1,
      0
    );
    
    results.totalMonths = totalMonths;
    
    console.log('복무 기간: ', totalMonths, '개월');
    console.log('입대일: ', startDate.toLocaleDateString());
    console.log('전역일: ', endDate.toLocaleDateString());
    console.log('전역월 마지막 날: ', lastDayOfDischargeMonth.toLocaleDateString());
    
    // 현재 날짜 (매월 반복 계산용)
    let currentDate = new Date(startDate);
    
    // 매월 반복하며 납입액, 매칭액 계산 (전역월 포함)
    // <= 로 변경하여 전역월까지 포함하도록 수정
    while (currentDate <= endDate) {
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1; // 0부터 시작하므로 +1
      
      // 연도별 정책 정보 (없으면 2025 이후 동일 가정)
      let yearMatchInfo = this.constants.matchInfo[currentYear];
      if (!yearMatchInfo) {
        yearMatchInfo = { matchPercent: 1.0, maxDeposit: 550000 };
      }
      
      // 해당 연도의 사용자 입력 납입액
      const userDeposit = this.getUserDepositForYear(currentYear);
      
      // 이번 달 납입액과 매칭액 계산
      const thisMonthDeposit = Math.min(userDeposit, yearMatchInfo.maxDeposit);
      const thisMonthMatch = thisMonthDeposit * yearMatchInfo.matchPercent;
      
      // 누적
      results.totalDeposit += thisMonthDeposit;
      results.totalMatched += thisMonthMatch;
      
      // 월별 상세 정보 저장
      results.monthlyDetails.push({
        date: new Date(currentDate),
        year: currentYear,
        month: currentMonth,
        deposit: thisMonthDeposit,
        match: thisMonthMatch,
        runningTotal: results.totalDeposit + results.totalMatched
      });
      
      // 다음 달로 이동
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    // 이자 계산 (원금에 대해 5% 단리)
    results.interest = results.totalDeposit * this.constants.interestRate;
    
    // 최종 합계
    results.finalTotal = results.totalDeposit + results.totalMatched + results.interest;
    
    console.log('계산 결과: ', results);
    
    // 결과 저장 및 반환
    this.data.results = results;
    return results;
  } catch (error) {
    console.error('계산 중 오류 발생: ', error);
    return {
      totalMonths: 0,
      totalDeposit: 0,
      totalMatched: 0,
      interest: 0,
      finalTotal: 0,
      monthlyDetails: []
    };
  }
},
        
        // 복무 기간 계산
        const startDate = new Date(this.data.startDate);
        const totalMonths = this.constants.serviceMonths[this.data.branch];
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + totalMonths);
        
        results.totalMonths = totalMonths;
        
        console.log('복무 기간: ', totalMonths, '개월');
        console.log('입대일: ', startDate.toLocaleDateString());
        console.log('전역일: ', endDate.toLocaleDateString());
        
        // 현재 날짜 (매월 반복 계산용)
        let currentDate = new Date(startDate);
        
        // 매월 반복하며 납입액, 매칭액 계산
        while (currentDate < endDate) {
          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth() + 1; // 0부터 시작하므로 +1
          
          // 연도별 정책 정보 (없으면 2025 이후 동일 가정)
          let yearMatchInfo = this.constants.matchInfo[currentYear];
          if (!yearMatchInfo) {
            yearMatchInfo = { matchPercent: 1.0, maxDeposit: 550000 };
          }
          
          // 해당 연도의 사용자 입력 납입액
          const userDeposit = this.getUserDepositForYear(currentYear);
          
          // 이번 달 납입액과 매칭액 계산
          const thisMonthDeposit = Math.min(userDeposit, yearMatchInfo.maxDeposit);
          const thisMonthMatch = thisMonthDeposit * yearMatchInfo.matchPercent;
          
          // 누적
          results.totalDeposit += thisMonthDeposit;
          results.totalMatched += thisMonthMatch;
          
          // 월별 상세 정보 저장
          results.monthlyDetails.push({
            date: new Date(currentDate),
            year: currentYear,
            month: currentMonth,
            deposit: thisMonthDeposit,
            match: thisMonthMatch,
            runningTotal: results.totalDeposit + results.totalMatched
          });
          
          // 다음 달로 이동
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
        
        // 이자 계산 (원금에 대해 5% 단리)
        results.interest = results.totalDeposit * this.constants.interestRate;
        
        // 최종 합계
        results.finalTotal = results.totalDeposit + results.totalMatched + results.interest;
        
        console.log('계산 결과: ', results);
        
        // 결과 저장 및 반환
        this.data.results = results;
        return results;
      } catch (error) {
        console.error('계산 중 오류 발생: ', error);
        return {
          totalMonths: 0,
          totalDeposit: 0,
          totalMatched: 0,
          interest: 0,
          finalTotal: 0,
          monthlyDetails: []
        };
      }
    },
    
    /**
     * 해당 연도에 대한 사용자 입력 납입액 조회
     * @param {Number} year 연도
     * @returns {Number} 월 납입액
     */
    getUserDepositForYear(year) {
      if (year <= 2022) return this.data.deposits[2022];
      if (year === 2023) return this.data.deposits[2023];
      if (year === 2024) return this.data.deposits[2024];
      // 2025년 이상
      return this.data.deposits[2025];
    },
    
    /**
     * 결과 데이터 로컬 스토리지에 저장
     */
    saveToLocalStorage() {
      try {
        const saveData = {
          inputs: {
            startDate: this.data.startDate,
            branch: this.data.branch,
            deposits: this.data.deposits
          },
          results: this.data.results,
          savedAt: new Date().toISOString()
        };
        
        localStorage.setItem('militarySavingsCalculation', JSON.stringify(saveData));
        console.log('로컬 스토리지에 저장 완료');
      } catch (error) {
        console.error('로컬 스토리지 저장 오류: ', error);
      }
    },
    
    /**
     * 로컬 스토리지에서 저장된 결과 불러오기
     * @returns {Object|null} 저장된 데이터
     */
    loadFromLocalStorage() {
      try {
        const savedData = localStorage.getItem('militarySavingsCalculation');
        if (!savedData) return null;
        
        return JSON.parse(savedData);
      } catch (e) {
        console.error('로컬 스토리지 데이터 파싱 오류:', e);
        return null;
      }
    },
    
    /**
     * 공유용 URL 생성 - 여전히 원 단위 값으로 URL 생성
     * @returns {String} 공유 URL
     */
    generateShareUrl() {
      try {
        const baseUrl = window.location.origin + window.location.pathname;
        const params = new URLSearchParams();
        
        params.append('startDate', this.data.startDate.toISOString().split('T')[0]);
        params.append('branch', this.data.branch);
        
        // 만원 단위로 변환하지 않고 원 단위 그대로 URL에 포함
        // 이렇게 해야 기존 공유 URL과 호환성 유지
        Object.entries(this.data.deposits).forEach(([year, amount]) => {
          params.append(`deposit${year}`, amount);
        });
        
        return `${baseUrl}?${params.toString()}`;
      } catch (error) {
        console.error('공유 URL 생성 오류: ', error);
        return window.location.href;
      }
    }

  /**
   * VIEW: UI 업데이트 및 렌더링
   */
  const CalculatorView = {
    // DOM 요소들
    elements: null,
    chart: null,
    shareModal: null,
    
    /**
     * DOM 요소 초기화
     */
    initElements() {
      try {
        this.elements = {
          form: document.getElementById('calculatorForm'),
          startDate: document.getElementById('startDate'),
          branch: document.getElementById('branch'),
          deposit2022: document.getElementById('deposit2022'),
          deposit2023: document.getElementById('deposit2023'),
          deposit2024: document.getElementById('deposit2024'),
          deposit2025: document.getElementById('deposit2025'),
          calculateBtn: document.getElementById('calculateBtn'),
          resetBtn: document.getElementById('resetBtn'),
          result: document.getElementById('result'),
          resultContent: document.getElementById('resultContent'),
          resultChart: document.getElementById('resultChart'),
          monthlyDetails: document.getElementById('monthlyDetails'),
          shareBtn: document.getElementById('shareBtn'),
          saveBtn: document.getElementById('saveBtn'),
          printBtn: document.getElementById('printBtn'),
          shareLink: document.getElementById('shareLink'),
          copyLinkBtn: document.getElementById('copyLinkBtn')
        };
        
        // 부트스트랩 모달 초기화 (DOM 로드 후)
        const shareModalElement = document.getElementById('shareModal');
        if (shareModalElement) {
          this.shareModal = new bootstrap.Modal(shareModalElement);
        } else {
          console.error('shareModal 요소를 찾을 수 없습니다.');
        }
        
        // DOM 요소 체크
        for (const [key, element] of Object.entries(this.elements)) {
          if (!element) {
            console.warn(`DOM 요소 누락: ${key}`);
          }
        }
      } catch (error) {
        console.error('DOM 요소 초기화 오류: ', error);
      }
    },
    
    /**
     * 입력 폼 값 가져오기
     * @returns {Object} 폼 입력값
     */
    getInputValues() {
      try {
        return {
          startDate: this.elements.startDate.value,
          branch: this.elements.branch.value,
          deposits: {
            2022: this.elements.deposit2022.value,
            2023: this.elements.deposit2023.value,
            2024: this.elements.deposit2024.value,
            2025: this.elements.deposit2025.value
          }
        };
      } catch (error) {
        console.error('입력값 가져오기 오류: ', error);
        return { startDate: '', branch: '', deposits: {} };
      }
    },
    
    /**
 * 저장된 데이터로 폼 채우기 - 원 단위에서 만원 단위로 변환
 * @param {Object} data 저장된 입력 데이터
 */
fillFormWithSavedData(data) {
  try {
    if (!data || !data.inputs) return;
    
    this.elements.startDate.value = new Date(data.inputs.startDate).toISOString().split('T')[0];
    this.elements.branch.value = data.inputs.branch;
    
    // 원 단위를 만원 단위로 변환 (÷ 10000)
    this.elements.deposit2022.value = data.inputs.deposits[2022] ? (data.inputs.deposits[2022] / 10000) : '';
    this.elements.deposit2023.value = data.inputs.deposits[2023] ? (data.inputs.deposits[2023] / 10000) : '';
    this.elements.deposit2024.value = data.inputs.deposits[2024] ? (data.inputs.deposits[2024] / 10000) : '';
    this.elements.deposit2025.value = data.inputs.deposits[2025] ? (data.inputs.deposits[2025] / 10000) : '';
  } catch (error) {
    console.error('저장 데이터로 폼 채우기 오류: ', error);
  }
},

/**
 * URL 파라미터로 폼 채우기 - 만원 단위 고려
 */
fillFormFromUrlParams() {
  try {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('startDate')) {
      this.elements.startDate.value = params.get('startDate');
    }
    
    if (params.has('branch')) {
      this.elements.branch.value = params.get('branch');
    }
    
    // URL 파라미터는 원 단위로 저장되어 있으므로 만원 단위로 변환
    if (params.has('deposit2022')) {
      this.elements.deposit2022.value = parseInt(params.get('deposit2022')) / 10000;
    }
    
    if (params.has('deposit2023')) {
      this.elements.deposit2023.value = parseInt(params.get('deposit2023')) / 10000;
    }
    
    if (params.has('deposit2024')) {
      this.elements.deposit2024.value = parseInt(params.get('deposit2024')) / 10000;
    }
    
    if (params.has('deposit2025')) {
      this.elements.deposit2025.value = parseInt(params.get('deposit2025')) / 10000;
    }
    
    // URL 파라미터가 있다면 자동 계산
    if (params.has('startDate') && params.has('branch')) {
      setTimeout(() => {
        if (this.elements.calculateBtn) {
          this.elements.calculateBtn.click();
        }
      }, 500);
    }
  } catch (error) {
    console.error('URL 파라미터로 폼 채우기 오류: ', error);
  }
},

    /**
     * 계산 결과 화면에 표시
     * @param {Object} results 계산 결과
     */
    displayResults(results) {
      try {
        // 결과 카드 표시
        this.elements.result.classList.remove('d-none');
        this.elements.result.classList.add('fade-in');
        
        // 스크롤 이동 (모바일에서 필요)
        if (window.innerWidth < 992) {
          this.elements.result.scrollIntoView({ behavior: 'smooth' });
        }
        
        // 결과 내용 채우기
        this.elements.resultContent.innerHTML = `
          <div class="alert alert-success mb-4">
            <h6 class="fw-bold mb-2">복무 기간 정보</h6>
            <div class="d-flex justify-content-between align-items-center">
              <div>복무 시작일</div>
              <div class="fw-medium">${new Date(CalculatorModel.data.startDate).toLocaleDateString()}</div>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <div>예상 전역일</div>
              <div class="fw-medium">
                ${this.calculateEndDate(CalculatorModel.data.startDate, results.totalMonths).toLocaleDateString()}
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <div>총 복무 기간</div>
              <div class="fw-medium">${results.totalMonths}개월</div>
            </div>
          </div>
          
          <div class="card mb-4 border-0 shadow-sm">
            <div class="card-body p-0">
              <ul class="list-group list-group-flush">
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <div>내가 납입한 원금</div>
                  <div class="result-value">${this.formatCurrency(results.totalDeposit)} 원</div>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <div>정부 매칭 지원금</div>
                  <div class="result-value">${this.formatCurrency(results.totalMatched)} 원</div>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <div>원금에 대한 5% 이자</div>
                  <div class="result-value">${this.formatCurrency(results.interest)} 원</div>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center bg-light">
                  <div class="fw-bold">예상 수령액 합계</div>
                  <div class="total-amount">${this.formatCurrency(results.finalTotal)} 원</div>
                </li>
              </ul>
            </div>
          </div>
        `;
        
        // 차트 렌더링
        this.renderResultChart(results);
        
        // 월별 상세 정보 렌더링
        this.renderMonthlyDetails(results.monthlyDetails);
        
        console.log('결과 표시 완료');
      } catch (error) {
        console.error('결과 표시 오류: ', error);
        this.elements.resultContent.innerHTML = `
          <div class="alert alert-danger">
            <h6 class="fw-bold">오류 발생</h6>
            <p>결과를 표시하는 중 오류가 발생했습니다. 다시 시도해주세요.</p>
            <p>오류 내용: ${error.message}</p>
          </div>
        `;
      }
    },
    
    /**
     * 결과 차트 렌더링
     * @param {Object} results 계산 결과
     */
    renderResultChart(results) {
      try {
        const ctx = this.elements.resultChart.getContext('2d');
        
        // 기존 차트 파괴 (재렌더링 시)
        if (this.chart) {
          this.chart.destroy();
        }
        
        // 차트 데이터 준비
        const chartData = {
          labels: ['총액 구성'],
          datasets: [
            {
              label: '내 납입금',
              data: [results.totalDeposit],
              backgroundColor: 'rgba(59, 113, 202, 0.7)',
            },
            {
              label: '정부 매칭 지원금',
              data: [results.totalMatched],
              backgroundColor: 'rgba(20, 164, 77, 0.7)',
            },
            {
              label: '이자',
              data: [results.interest],
              backgroundColor: 'rgba(244, 162, 97, 0.7)',
            }
          ]
        };
        
        // 차트 옵션
        const chartOptions = {
          indexAxis: 'y',
          plugins: {
            title: {
              display: true,
              text: '예상 수령액 구성',
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            legend: {
              position: 'bottom'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  label += new Intl.NumberFormat('ko-KR').format(context.raw) + '원';
                  return label;
                }
              }
            }
          },
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              stacked: true,
              ticks: {
                callback: function(value) {
                  return new Intl.NumberFormat('ko-KR', { 
                    notation: 'compact',
                    compactDisplay: 'short'
                  }).format(value) + '원';
                }
              }
            },
            y: {
              stacked: true
            }
          }
        };
        
        // 차트 생성
        this.chart = new Chart(ctx, {
          type: 'bar',
          data: chartData,
          options: chartOptions
        });
        
        console.log('차트 렌더링 완료');
      } catch (error) {
        console.error('차트 렌더링 오류: ', error);
      }
    },
    
    /**
     * 월별 상세 정보 렌더링
     * @param {Array} monthlyDetails 월별 상세 내역
     */
    renderMonthlyDetails(monthlyDetails) {
      try {
        if (!monthlyDetails || monthlyDetails.length === 0) {
          this.elements.monthlyDetails.innerHTML = '<p class="text-center my-3">상세 정보가 없습니다.</p>';
          return;
        }
        
        // 연도별로 그룹화
        const yearlyGroups = monthlyDetails.reduce((groups, item) => {
          const year = item.year;
          if (!groups[year]) {
            groups[year] = [];
          }
          groups[year].push(item);
          return groups;
        }, {});
        
        let detailsHtml = '<div class="table-responsive">';
        
        // 연도별 테이블 생성
        Object.entries(yearlyGroups).forEach(([year, months]) => {
          detailsHtml += `
            <h6 class="mt-4 mb-2 fw-bold">${year}년</h6>
            <table class="table table-sm table-hover">
              <thead class="table-light">
                <tr>
                  <th>월</th>
                  <th class="text-end">납입액</th>
                  <th class="text-end">매칭액</th>
                  <th class="text-end">누적액</th>
                </tr>
              </thead>
              <tbody>
          `;
          
          months.forEach(month => {
            detailsHtml += `
              <tr>
                <td>${month.month}월</td>
                <td class="text-end">${this.formatCurrency(month.deposit)}원</td>
                <td class="text-end">${this.formatCurrency(month.match)}원</td>
                <td class="text-end">${this.formatCurrency(month.runningTotal)}원</td>
              </tr>
            `;
          });
          
          detailsHtml += `
              </tbody>
            </table>
          `;
        });
        
        detailsHtml += '</div>';
        
        this.elements.monthlyDetails.innerHTML = detailsHtml;
        
        console.log('월별 상세 정보 렌더링 완료');
      } catch (error) {
        console.error('월별 상세 정보 렌더링 오류: ', error);
        this.elements.monthlyDetails.innerHTML = '<p class="text-center my-3">월별 상세 정보를 표시하는 중 오류가 발생했습니다.</p>';
      }
    },
    
    /**
     * 공유 모달에 링크 표시
     * @param {String} shareUrl 공유용 URL
     */
    showShareModal(shareUrl) {
      try {
        this.elements.shareLink.value = shareUrl;
        
        if (this.shareModal) {
          this.shareModal.show();
        } else {
          console.error('shareModal이 초기화되지 않았습니다.');
          alert('링크가 복사되었습니다: ' + shareUrl);
        }
      } catch (error) {
        console.error('공유 모달 표시 오류: ', error);
        alert('공유 기능 오류: ' + error.message);
      }
    },
    
    /**
     * 입력 폼 초기화
     */
    resetForm() {
      try {
        this.elements.form.reset();
        this.elements.result.classList.add('d-none');
        
        // 차트 리셋
        if (this.chart) {
          this.chart.destroy();
          this.chart = null;
        }
        
        console.log('폼 초기화 완료');
      } catch (error) {
        console.error('폼 초기화 오류: ', error);
      }
    },
    
    /**
     * 폼 유효성 검사 시각화
     * @param {Boolean} isValid 유효성 여부
     */
    setFormValidState(isValid) {
      try {
        if (isValid) {
          this.elements.form.classList.remove('was-validated');
        } else {
          this.elements.form.classList.add('was-validated');
        }
      } catch (error) {
        console.error('폼 유효성 검사 시각화 오류: ', error);
      }
    },
    
    /**
     * 계산 버튼 로딩 상태 변경
     * @param {Boolean} isLoading 로딩중 여부
     */
    setCalculateButtonLoading(isLoading) {
      try {
        const btn = this.elements.calculateBtn;
        
        if (isLoading) {
          btn.disabled = true;
          btn.innerHTML = '<span class="loading me-2"></span>계산 중...';
        } else {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-calculator me-2"></i>계산하기';
        }
      } catch (error) {
        console.error('계산 버튼 로딩 상태 변경 오류: ', error);
      }
    },
    
    /**
     * 날짜에서 복무개월 더해서 전역일 계산
     * @param {Date} startDate 시작일
     * @param {Number} months 개월 수
     * @returns {Date} 전역일
     */
    calculateEndDate(startDate, months) {
      try {
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + months);
        return endDate;
      } catch (error) {
        console.error('전역일 계산 오류: ', error);
        return new Date();
      }
    },
    
    /**
     * 숫자 포맷 (3자리 콤마)
     * @param {Number} value 포맷할 숫자
     * @returns {String} 포맷된 문자열
     */
    formatCurrency(value) {
      try {
        return new Intl.NumberFormat('ko-KR').format(Math.round(value));
      } catch (error) {
        console.error('숫자 포맷 오류: ', error);
        return String(value);
      }
    },
    
    /**
     * 초기 UI 셋업
     */
    init() {
      try {
        console.log('뷰 초기화 시작');
        
        // DOM 요소 초기화
        this.initElements();
        
        // Bootstrap 툴팁 초기화
        const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltips.forEach(tooltip => {
          try {
            new bootstrap.Tooltip(tooltip);
          } catch (error) {
            console.warn('툴팁 초기화 오류: ', error);
          }
        });
        
        // 오늘 날짜를 startDate 입력의 기본값으로
        const today = new Date();
        if (this.elements.startDate) {
          this.elements.startDate.value = today.toISOString().split('T')[0];
        }
        
        // URL 파라미터로 폼 채우기
        this.fillFormFromUrlParams();
        
        console.log('뷰 초기화 완료');
      } catch (error) {
        console.error('뷰 초기화 오류: ', error);
        document.body.innerHTML += `<div class="alert alert-danger m-3">초기화 중 오류가 발생했습니다: ${error.message}</div>`;
      }
    }
  };

  /**
   * CONTROLLER: 이벤트 핸들링 및 제어 로직
   */
  const CalculatorController = {
    /**
     * 초기화 및 이벤트 핸들러 등록
     */
    init() {
      try {
        console.log('컨트롤러 초기화 시작');
        
        // View 초기화
        CalculatorView.init();
        
        // 저장된 데이터 불러오기
        const savedData = CalculatorModel.loadFromLocalStorage();
        if (savedData) {
          CalculatorView.fillFormWithSavedData(savedData);
        }
        
        // 폼 제출 이벤트 핸들러
        if (CalculatorView.elements.form) {
          CalculatorView.elements.form.addEventListener('submit', this.handleFormSubmit.bind(this));
        } else {
          console.error('폼 요소를 찾을 수 없습니다.');
        }
        
        // 폼 리셋 이벤트 핸들러
        if (CalculatorView.elements.resetBtn) {
          CalculatorView.elements.resetBtn.addEventListener('click', this.handleFormReset.bind(this));
        }
        
        // 공유 버튼 이벤트 핸들러
        if (CalculatorView.elements.shareBtn) {
          CalculatorView.elements.shareBtn.addEventListener('click', this.handleShare.bind(this));
        }
        
        // 저장 버튼 이벤트 핸들러
        if (CalculatorView.elements.saveBtn) {
          CalculatorView.elements.saveBtn.addEventListener('click', this.handleSave.bind(this));
        }
        
        // 인쇄 버튼 이벤트 핸들러
        if (CalculatorView.elements.printBtn) {
          CalculatorView.elements.printBtn.addEventListener('click', this.handlePrint.bind(this));
        }
        
        // 링크 복사 버튼 이벤트 핸들러
        if (CalculatorView.elements.copyLinkBtn) {
          CalculatorView.elements.copyLinkBtn.addEventListener('click', this.handleCopyLink.bind(this));
        }
        
        console.log('컨트롤러 초기화 완료');
      } catch (error) {
        console.error('컨트롤러 초기화 오류: ', error);
      }
    },
    
    /**
     * 폼 제출 처리
     * @param {Event} event 이벤트 객체
     */
    handleFormSubmit(event) {
      try {
        console.log('폼 제출 시작');
        event.preventDefault();
        
        // 로딩 상태 표시
        CalculatorView.setCalculateButtonLoading(true);
        
        // 입력값 가져오기
        const inputValues = CalculatorView.getInputValues();
        console.log('입력값: ', inputValues);
        
        // 모델에 데이터 설정하고 유효성 검사
        const isValid = CalculatorModel.setInputData(inputValues);
        CalculatorView.setFormValidState(isValid);
        
        if (!isValid) {
          console.warn('유효하지 않은 입력값');
          CalculatorView.setCalculateButtonLoading(false);
          return;
        }
        
        // 비동기 처리를 위해 setTimeout 사용 (UI 업데이트 시간 확보)
        setTimeout(() => {
          try {
            // 계산 실행
            const results = CalculatorModel.calculate();
            
            // 결과 표시
            CalculatorView.displayResults(results);
            
            // 로컬 스토리지에 저장
            CalculatorModel.saveToLocalStorage();
            
            console.log('폼 제출 완료: 결과 표시됨');
          } catch (error) {
            console.error('계산 중 오류: ', error);
            alert('계산 중 오류가 발생했습니다: ' + error.message);
          } finally {
            // 로딩 상태 해제
            CalculatorView.setCalculateButtonLoading(false);
          }
        }, 800);
      } catch (error) {
        console.error('폼 제출 처리 오류: ', error);
        CalculatorView.setCalculateButtonLoading(false);
        alert('오류가 발생했습니다: ' + error.message);
      }
    },
    
    /**
     * 폼 리셋 처리
     */
    handleFormReset() {
      try {
        CalculatorView.resetForm();
      } catch (error) {
        console.error('폼 리셋 오류: ', error);
      }
    },
    
    /**
     * 공유 기능 처리
     */
    handleShare() {
      try {
        const shareUrl = CalculatorModel.generateShareUrl();
        CalculatorView.showShareModal(shareUrl);
      } catch (error) {
        console.error('공유 처리 오류: ', error);
        alert('공유 기능 오류: ' + error.message);
      }
    },
    
    /**
     * 저장 기능 처리
     */
    handleSave() {
      try {
        CalculatorModel.saveToLocalStorage();
        
        // 저장 완료 메시지 표시
        alert('계산 결과가 저장되었습니다. 다음에 방문 시 자동으로 불러옵니다.');
      } catch (error) {
        console.error('저장 처리 오류: ', error);
        alert('저장 기능 오류: ' + error.message);
      }
    },
    
    /**
     * 인쇄 기능 처리
     */
    handlePrint() {
      try {
        window.print();
      } catch (error) {
        console.error('인쇄 처리 오류: ', error);
        alert('인쇄 기능 오류: ' + error.message);
      }
    },
    
    /**
     * 링크 복사 기능 처리
     */
    handleCopyLink() {
      try {
        const shareLink = CalculatorView.elements.shareLink;
        
        // 링크 선택 및 복사
        shareLink.select();
        
        // 현대적인 클립보드 API 사용 시도
        if (navigator.clipboard) {
          navigator.clipboard.writeText(shareLink.value)
            .then(() => {
              this.showCopyFeedback();
            })
            .catch((err) => {
              console.error('클립보드 API 오류: ', err);
              // 대체 방법 사용
              document.execCommand('copy');
              this.showCopyFeedback();
            });
        } else {
          // 구형 브라우저용 대체 방법
          document.execCommand('copy');
          this.showCopyFeedback();
        }
      } catch (error) {
        console.error('링크 복사 오류: ', error);
        alert('링크 복사 중 오류가 발생했습니다.');
      }
    },
    
    /**
     * 복사 피드백 표시
     */
    showCopyFeedback() {
      try {
        // 복사 버튼 피드백
        const copyBtn = CalculatorView.elements.copyLinkBtn;
        const originalText = copyBtn.innerHTML;
        
        copyBtn.innerHTML = '<i class="fas fa-check me-1"></i>복사됨';
        copyBtn.classList.remove('btn-outline-primary');
        copyBtn.classList.add('btn-success');
        
        // 원래 상태로 복구
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
          copyBtn.classList.remove('btn-success');
          copyBtn.classList.add('btn-outline-primary');
        }, 2000);
      } catch (error) {
        console.error('복사 피드백 표시 오류: ', error);
      }
    }
  };

  // 앱 초기화
  console.log('앱 초기화 시작');
  
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 로드 완료');
    try {
      CalculatorController.init();
    } catch (error) {
      console.error('앱 초기화 중 오류: ', error);
      alert('앱을 초기화하는 중 오류가 발생했습니다: ' + error.message);
    }
  });
  
  // 디버깅 확인용 전역 변수 설정
  window.gunjukCalculator = {
    model: CalculatorModel,
    view: CalculatorView,
    controller: CalculatorController
  };
  
  console.log('앱 초기화 완료');
})();