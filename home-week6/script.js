const plants = document.querySelectorAll('.plant');
let x = 10; // z-index 초기값
let rotationAngle = -10; // 초기 회전 각도
let y = 0; // 이미지 회전 조절 값

plants.forEach(plant => {
    plant.addEventListener('dragstart', dragStart);
    plant.addEventListener('drag', drag);
    plant.addEventListener('dragend', dragEnd);
    plant.addEventListener('dblclick', increaseZIndex);
});

function dragStart(e) {
    e.target.style.zIndex = ++x; // 클릭 시 z-index 증가
    e.dataTransfer.setData('text/plain', e.target.id); // 드래그하는 요소의 id 저장
    e.target.style.opacity = '1'; // 드래그 시 시각적 피드백

    // 기본 드래그 미리보기 이미지 제거
    const emptyImg = new Image();
    emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    e.dataTransfer.setDragImage(emptyImg, 0, 0);
}

function drag(e) {
    if (e.clientX === 0 && e.clientY === 0) return; // 드래그가 끝나면 회전 중지

    const draggedElement = document.getElementById(e.target.id);

    // 마우스를 따라 이동하도록 위치와 회전을 설정
    draggedElement.style.position = 'fixed';
    draggedElement.style.left = `${e.clientX - draggedElement.offsetWidth / 2}px`;
    draggedElement.style.top = `${e.clientY - draggedElement.offsetHeight / 2}px`;

    // 회전 변환 적용
    if (y % 8 >= 0 && y % 8 < 4){
        rotationAngle += 5;
        y++;
    } else {
        rotationAngle -= 5;
        y++;
    }

    draggedElement.style.transform = `rotate(${rotationAngle}deg)`;
}

function dragEnd(e) {
    e.target.style.opacity = '1'; // 드래그 종료 시 원래 상태로 복원
}

// 드롭 가능한 영역 설정 (body 전체를 드롭 가능하게 만듦)
document.body.addEventListener('dragover', (e) => {
    e.preventDefault(); // 드롭 가능하도록 기본 동작 방지
});

document.body.addEventListener('drop', (e) => {
    e.preventDefault();
    const plantId = e.dataTransfer.getData('text'); // 드래그한 요소의 id 가져오기
    const draggedElement = document.getElementById(plantId);

    // 드롭 위치에 맞게 요소 이동
    draggedElement.style.left = `${e.clientX - draggedElement.offsetWidth / 2}px`;
    draggedElement.style.top = `${e.clientY - draggedElement.offsetHeight / 2}px`;

    let currentTop = parseInt(draggedElement.style.top); // 문자열을 숫자로 변환

    const moveDown = setInterval(() => {
        if (currentTop < 610) {
            currentTop += 5; // 5px씩 아래로 이동
            draggedElement.style.top = `${currentTop}px`;
        } else {
            clearInterval(moveDown); // 610px에 도달하면 애니메이션 중지
        }
        if (y % 8 >= 0 && y % 8 < 4){
            rotationAngle += 5;
            y++;
        } else {
            rotationAngle -= 5;
            y++;
        }
        draggedElement.style.transform = `rotate(${rotationAngle}deg)`;
    }, 16); // 약 60fps로 애니메이션 (16ms 간격)
});

function increaseZIndex(e) {
    e.target.style.zIndex = ++x; // 더블 클릭 시 z-index 증가
}
