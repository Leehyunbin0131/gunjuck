
// 연도별 매칭 정보
const MATCH_INFO = {
  2022: { matchPercent: 0.33, maxDeposit: 400000 },
  2023: { matchPercent: 0.71, maxDeposit: 400000 },
  2024: { matchPercent: 1.0 , maxDeposit: 400000 },
  2025: { matchPercent: 1.0 , maxDeposit: 550000 }
  // 2026년 이후 필요 시 추가 가능
};

// 군종별 복무 개월
const SERVICE_MONTHS = {
  army: 18,
  navy: 20,
  airforce: 21
};

// "원금(내 납입액)에 대해 5% 이자" 적용
const INTEREST_RATE = 0.05;

/**
 * 계산하기 버튼 클릭 시 호출되는 함수
 */
function calculate() {
  // 1) 입력값 가져오기
  const startDateValue = document.getElementById('startDate').value;
  const branch = document.getElementById('branch').value;

  const userDeposit2022 = Number(document.getElementById('deposit2022').value) || 0;
  const userDeposit2023 = Number(document.getElementById('deposit2023').value) || 0;
  const userDeposit2024 = Number(document.getElementById('deposit2024').value) || 0;
  const userDeposit2025 = Number(document.getElementById('deposit2025').value) || 0;

  // 2) 간단 검증
  if (!startDateValue) {
    alert('입대일을 선택해주세요.');
    return;
  }
  if (!branch) {
    alert('군종을 선택해주세요.');
    return;
  }

  // 3) 복무 기간 계산
  const startDate = new Date(startDateValue);
  const totalMonths = SERVICE_MONTHS[branch];
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + totalMonths);

  // 4) 매월 반복하며 납입액, 매칭액 계산
  let totalMyDeposit = 0;
  let totalMatched = 0;

  let currentDate = new Date(startDate);

  while (currentDate < endDate) {
    const currentYear = currentDate.getFullYear();

    // 연도별 정책 정보 (없으면 2025 이후 동일 가정)
    let yearMatchInfo = MATCH_INFO[currentYear];
    if (!yearMatchInfo) {
      yearMatchInfo = { matchPercent: 1.0, maxDeposit: 550000 };
    }

    // 사용자 입력 납입액 vs 그 해의 정책 한도
    const userDeposit = getUserDepositForYear(currentYear, {
      '2022': userDeposit2022,
      '2023': userDeposit2023,
      '2024': userDeposit2024,
      '2025': userDeposit2025
    });

    const thisMonthDeposit = Math.min(userDeposit, yearMatchInfo.maxDeposit);
    const thisMonthMatch = thisMonthDeposit * yearMatchInfo.matchPercent;

    totalMyDeposit += thisMonthDeposit;
    totalMatched += thisMonthMatch;

    // 다음 달
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  // 5) 이자 계산 (원금에 대해 5% 단리 가정)
  const interest = totalMyDeposit * INTEREST_RATE;

  // 6) 최종 합계
  const finalTotal = totalMyDeposit + totalMatched + interest;

  // 7) 결과 표시
  const resultDiv = document.getElementById('result');
  const resultContent = document.getElementById('resultContent');

  // 숨김 해제
  resultDiv.classList.remove('d-none');

  resultContent.innerHTML = `
    <ul class="list-group list-group-flush">
      <li class="list-group-item">
        <strong>총 복무 개월:</strong> 
        <span class="ms-2">${totalMonths}개월</span>
      </li>
      <li class="list-group-item">
        <strong>내가 납입한 원금:</strong> 
        <span class="ms-2">${formatCurrency(totalMyDeposit)} 원</span>
      </li>
      <li class="list-group-item">
        <strong>매칭 지원금:</strong> 
        <span class="ms-2">${formatCurrency(totalMatched)} 원</span>
      </li>
      <li class="list-group-item">
        <strong>원금에 대한 5% 이자:</strong> 
        <span class="ms-2">${formatCurrency(interest)} 원</span>
      </li>
      <li class="list-group-item bg-light">
        <strong>예상 수령액 합계:</strong> 
        <span class="ms-2">${formatCurrency(finalTotal)} 원</span>
      </li>
    </ul>
  `;
}

/**
 * 해당 연도에 대해, 사용자 입력한 월 납입액 리턴
 */
function getUserDepositForYear(year, deposits) {
  if (year <= 2022) return deposits['2022'];
  if (year === 2023) return deposits['2023'];
  if (year === 2024) return deposits['2024'];
  // 2025년 이상
  return deposits['2025'];
}

/**
 * 숫자를 3자리마다 콤마(,) 삽입
 */
function formatCurrency(value) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
