# 레이아웃 가이드

1. 기본 슬라이드:
 --- 구분자 다음에 일반 Markdown 작성

2. 표지 (title):
 <!-- _class: title -->

3. 구분 슬라이드 (divider):
 <!-- _class: divider -->

4. 2단 분할 (two-col):
 <!-- _class: two-col -->
 명시적 <div>로 좌우 열을 구분합니다. 다른 클래스와 조합 가능.
 좌우 비율 커스텀: <style scoped>section { --cols: 1fr 2fr; }</style>
 예시:
   <div>

   ### 왼쪽 열 제목
   - 내용

   </div>

   <div>

   ### 오른쪽 열 제목
   - 내용

   </div>

5. SWOT 분석 (swot):
 <!-- _class: swot -->
 3x3 Markdown 표를 사용합니다:
 첫 행: 빈칸 | 강점 | 약점
 이후 행: 기회/위협 레이블 | 내용 | 내용

6. 타임라인 (timeline):
 <!-- _class: timeline -->
 순서 없는 목록(ul)을 사용합니다.
 각 항목은 <br>로 줄바꿈합니다 (html: true 필요).

7. 목차 (toc):
 <!-- _class: toc -->
 ## 목차
 ### 본문
 - 섹션명 `페이지번호`
 ### 참고자료
 - 항목 `페이지번호`
 코드 인라인(`숫자`)이 오른쪽 페이지 번호로 표시됩니다.
 grid-auto-flow: column 방식으로 h3+ul 쌍이 자동으로 두 열에 배치됩니다.

8. 강조 박스 섹션 (highlight-boxes):
 <!-- _class: highlight-boxes -->
 h3 요소가 컬러 배경 전체너비 박스로 표시됩니다. 최대 5개 섹션.
 h3 뒤에 오는 ul/p가 해당 박스의 내용입니다.
 기본 색상: 1번(보라), 2번(청록), 3번(녹색), 4번(남색), 5번(적색)

 띠 색상 커스터마이징: <style scoped>로 --hbox-color-N 변수를 오버라이드합니다.
 사전 정의된 gradient color map (각 9단계):
   - viridis: --cmap-viridis-1 ~ --cmap-viridis-9
   - plasma:  --cmap-plasma-1  ~ --cmap-plasma-9
   - magma:   --cmap-magma-1   ~ --cmap-magma-9
 예시 (plasma 적용):
   <style scoped>
   section {
     --hbox-color-1: var(--cmap-plasma-1);
     --hbox-color-2: var(--cmap-plasma-3);
     --hbox-color-3: var(--cmap-plasma-5);
     --hbox-color-4: var(--cmap-plasma-7);
     --hbox-color-5: var(--cmap-plasma-9);
   }
   </style>

9. 3단 분할 (three-col):
 <!-- _class: three-col -->
 명시적 <div>로 3열을 구분합니다. two-col과 동일한 방식.
 열 비율 커스텀: <style scoped>section { --cols: 2fr 1fr 1fr; }</style>
 예시:
   <div>

   ### 첫 번째 열
   - 내용

   </div>

   <div>

   ### 두 번째 열
   - 내용

   </div>

   <div>

   ### 세 번째 열
   - 내용

   </div>

10. 핵심 강조 + 체크리스트 (focus):
  <!-- _class: focus -->
  blockquote = 중앙 강조 문장 박스
  ul = 2열 체크 아이콘 항목 리스트

11. 번호형 단계/목표 (end-product-list):
  <!-- _class: end-product-list -->
  ol을 사용합니다. 각 항목 왼쪽에 컬러 번호 배지가 표시됩니다.
  최대 5개 항목 지원 (각기 다른 색상).

12. 인물/기관 프로필 (profile):
  <!-- _class: profile -->
  첫 번째 img가 왼쪽 사진(210px)으로 배치됩니다.
  h3 + ul 쌍이 오른쪽 열에 나열됩니다.

13. 2×2 박스 그리드 (four-box):
  <!-- _class: four-box -->
  ul/ol의 4개 항목이 2×2 그리드 박스로 배치됩니다.
  각 항목의 **굵은 글자** 첫 줄이 박스 제목이 됩니다.

14. 참고자료/부록 (appendix):
  <!-- _class: appendix -->
  상단에 진한 헤더 바가 표시됩니다. 참고자료 섹션 구분에 사용합니다.

15. 간트 차트 / 개발 추진일정 (gantt):
  <!-- _class: gantt -->
  Markdown 표를 사용합니다. ■ 또는 ● 문자로 일정 바를 표시합니다.
  첫 두 열은 내용 열(좌정렬), 나머지는 월 열(중앙정렬)로 처리됩니다.

16. 연구개발팀 소개 (team-intro):
  <!-- _class: team-intro -->
  h3 + ul 쌍이 하나의 카드 상자로 표시됩니다.
  컬럼 수는 h3+ul 쌍 개수에 따라 자동 조정됩니다.
  h3에 data-org 속성으로 기관 유형별 색상을 지정합니다.
  h3 내부의 <code>(백틱)은 기관명을 강조 표시합니다.
  색상: 주관(주황), 공동(검정), 위탁(보라), 수요(녹색), 수혜(파랑), 미지정(회색)
  예시:
    <h3 data-org="주관">주관기관 <code>기관명</code></h3>

    * 팀 편성
      - 연구책임자 OOO 외 OO명
    * 전문성
      - 핵심 기술 역량
    * 담당 내용
      - 주요 담당 영역

17. 좌측 내용 + 우측 이미지 (side-by-side right-image):
  <!-- _class: side-by-side right-image -->
  텍스트를 <div>로, 이미지를 <div class="image">로 감싸서
  두 개의 그리드 열을 구성합니다. 각 열은 독립적으로 흐릅니다.
  이미지 열은 슬라이드 내부 영역 높이에 맞춰 자동 축소됩니다.
  좌우 비율 커스텀 (기본값 1fr 1fr):
    <style scoped>
    section { --cols: 1.5fr 1fr; }
    </style>
  작성 예:
    <div>

    ### 제목
    - 텍스트 내용

    </div>
    <div class="image">

    ![alt](images/example.png)

    </div>

18. 좌측 이미지 + 우측 내용 (side-by-side left-image):
  <!-- _class: side-by-side left-image -->
  side-by-side right-image의 좌우 반전 버전입니다.
  <div class="image">가 먼저, 텍스트 <div>가 뒤에 옵니다.
  좌우 비율 커스텀 (기본값 1fr 1fr):
    <style scoped>
    section { --cols: 1fr 1.5fr; }
    </style>

19. 자동 축소 (auto-shrink):
  콘텐츠가 슬라이드 영역을 초과하면 자동으로 축소합니다 (최소 65%).
  - title, divider를 제외한 모든 레이아웃(two-col, swot, timeline 포함)에 적용됩니다.
  - two-col: 섹션 전체 오버플로우 및 그리드 셀 내부 오버플로우 모두 감지합니다.
  - 특정 슬라이드에서 비활성화: <!-- _class: no-shrink -->

프로그레스 바:
marp.config.js 의 커스텀 엔진이 빌드 시점에 자동 주입합니다.
slides.md 에 <script> 블록을 추가할 필요 없습니다.

빌드:
make slides PROJECT=<name>        # PDF
make slides-html PROJECT=<name>   # HTML

<!-- vim: sts=2 sw=2 -->
