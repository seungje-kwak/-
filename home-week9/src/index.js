let currentFact = ''; // 현재 표시된 사실을 저장할 변수

// "Get Fact" 버튼 클릭 시 API 호출
document.getElementById('fetchFact').addEventListener('click', async () => {
  const factElement = document.getElementById('fact');
  factElement.textContent = 'Fetching a random fact...';

  try {
    const response = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    currentFact = data.text; // 현재 표시된 사실 업데이트
    factElement.textContent = currentFact;

    // 동적으로 "저장하기" 버튼 생성
    createSaveButton();
  } catch (error) {
    console.error('Error fetching the fact:', error);
    factElement.textContent = 'Failed to fetch a fact. Please try again later.';
  }
});

// "불러오기" 버튼 클릭 시 저장된 사실을 표시
document.getElementById('loadFacts').addEventListener('click', () => {
  loadSavedFacts();
});

// "저장하기" 버튼 생성 함수
function createSaveButton() {
  let saveButton = document.getElementById('saveFact');

  if (!saveButton) {
    // 버튼이 없으면 새로 생성
    saveButton = document.createElement('button');
    saveButton.id = 'saveFact';
    saveButton.textContent = 'Save Fact';
    saveButton.style.marginTop = '20px';
    document.getElementById('container').appendChild(saveButton);
  }

  // 버튼 클릭 시 최신 fact 저장
  saveButton.onclick = () => {
    saveFactToLocalStorage(currentFact);
  };
}

// 로컬 스토리지에 사실 저장
function saveFactToLocalStorage(fact) {
  if (!fact) {
    alert('No fact to save!');
    return;
  }

  const savedFacts = JSON.parse(localStorage.getItem('uselessFacts')) || [];
  savedFacts.push(fact);
  localStorage.setItem('uselessFacts', JSON.stringify(savedFacts));
  alert('Fact saved successfully!');
}

// 저장된 사실 불러오기 및 화면에 표시
function loadSavedFacts() {
  const savedFacts = JSON.parse(localStorage.getItem('uselessFacts')) || [];
  const savedFactsList = document.getElementById('savedFactsList');

  // 이전 리스트 제거
  savedFactsList.innerHTML = '';

  if (savedFacts.length === 0) {
    savedFactsList.innerHTML = '<li>No facts saved yet!</li>';
    return;
  }

  // 저장된 사실을 리스트로 표시
  savedFacts.forEach((fact, index) => {
    const listItem = document.createElement('li');
    listItem.textContent = `${index + 1}. ${fact}`;

    // 삭제 버튼 추가
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.style.marginLeft = '10px';
    deleteButton.addEventListener('click', () => {
      deleteFact(index);
    });

    listItem.appendChild(deleteButton);
    savedFactsList.appendChild(listItem);
  });
}

// 저장된 사실 삭제
function deleteFact(index) {
  const savedFacts = JSON.parse(localStorage.getItem('uselessFacts')) || [];

  // 해당 인덱스의 사실 삭제
  savedFacts.splice(index, 1);

  // 변경된 목록을 로컬 스토리지에 저장
  localStorage.setItem('uselessFacts', JSON.stringify(savedFacts));

  // 화면 업데이트
  loadSavedFacts();
}
