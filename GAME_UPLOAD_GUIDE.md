# 웹게임 추가 방법

이 저장소는 게임별로 `games/게임-폴더/`를 사용합니다. 새 게임을 올릴 때는 아래 순서만 따르면 됩니다.

1. 게임을 **웹 배포용 정적 파일**로 빌드합니다. 원스토어 웹게임이라면 원스토어 H5 SDK 연동을 포함한 빌드를 사용합니다.
2. `games/` 아래에 영문 소문자와 하이픈으로 새 폴더를 만듭니다. 예: `games/new-game/`.
3. 빌드 결과물의 **내용물**을 그 폴더에 넣습니다. `index.html`이 `games/new-game/index.html`에 바로 있어야 합니다. `dist/` 폴더를 한 번 더 감싸지 마세요.
4. `index.html`에서 사용하는 JS·CSS·이미지·모델·폰트 파일을 빠짐없이 함께 넣습니다. 파일 경로는 `./assets/...`처럼 게임 폴더 안에서 동작하도록 만듭니다.
5. 변경 파일을 확인하고 GitHub `main`에 올립니다.

```powershell
git add games/new-game/
git commit -m "Add new game web build"
git push origin main
```

배포가 반영되면 접속 주소는 `https://www.witlab.kr/games/new-game/`입니다. 실제 접속과 게임 실행은 업로드 후 확인하세요. 폴더만 추가하면 첫 화면의 게임 목록에는 자동으로 나타나지 않습니다.

## 이번에 올린 예시: 양궁의 신

- 저장소 폴더: [`games/archery-god/`](games/archery-god/)
- 실행 주소: <https://www.witlab.kr/games/archery-god/>
- 빌드 종류: 원스토어 H5 Game SDK가 포함된 웹 빌드
- 핵심 파일: `index.html`, `onestore-bootstrap.js`, `onestore-host.js`, `assets/`, `models/`, `textures/`, `fonts/`

이 저장소에는 게임의 **빌드 결과물**을 올립니다. 개발용 원본 코드와 서버 비밀번호·API 비밀키·`.env` 파일은 넣지 마세요.
