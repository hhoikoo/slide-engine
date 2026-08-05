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
 주의: 각 항목의 <br> 텍스트는 자동 줄바꿈 시 불균형해질 수 있습니다.
 긴 문장은 수동으로 <br>를 넣어 균형 잡힌 줄바꿈을 만들어야 합니다.

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
 h3 요소가 옅은 색 판으로 깔리고 왼쪽에 5px 강조 띠가 붙습니다. 최대 6개 섹션.
 h3 뒤에 오는 ul/p가 해당 박스의 내용입니다.
 색은 end-product-list 와 같은 팔레트를 씁니다.
 1번 주황, 2번 녹색, 3번 파랑, 4번 보라, 5번 적색, 6번 다크 네이비.

 제목 글자는 강조색이 아니라 본문색입니다.
 ep1 주황을 글자에 쓰면 2.85:1 로 21px bold 기준(3:1)에 못 미칩니다.
 색은 왼쪽 띠가 지고, 판은 그 색의 12% 틴트입니다.

 띠 색을 바꿀 때는 --hbox-color-N 을 지정합니다.
 사전 정의된 gradient color map (각 9단계):
   - viridis: --cmap-viridis-1 ~ --cmap-viridis-9
   - plasma:  --cmap-plasma-1  ~ --cmap-plasma-9
   - magma:   --cmap-magma-1   ~ --cmap-magma-9

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

12. 2×2 박스 그리드 (four-box):
  <!-- _class: four-box -->
  ul/ol의 4개 항목이 2×2 그리드 박스로 배치됩니다.
  각 항목의 **굵은 글자** 첫 줄이 박스 제목이 됩니다.

13. 참고자료/부록 (appendix):
  <!-- _class: appendix -->
  상단 바가 강조 파랑(--color-accent-blue)으로 깔립니다.
  본문 뒤에 붙는 부록 구간임을 표시할 때 씁니다.
  표의 첫 열은 가운데 정렬에 굵은 글자로 처리됩니다.

14. 좌측 내용 + 우측 이미지 (side-by-side right-image):
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

15. 좌측 이미지 + 우측 내용 (side-by-side left-image):
  <!-- _class: side-by-side left-image -->
  side-by-side right-image의 좌우 반전 버전입니다.
  <div class="image">가 먼저, 텍스트 <div>가 뒤에 옵니다.
  좌우 비율 커스텀 (기본값 1fr 1fr):
    <style scoped>
    section { --cols: 1fr 1.5fr; }
    </style>

16. 참고문헌 (references):
  <!-- _class: references -->
  본문보다 작은 폰트. 페이지 번호는 다른 슬라이드와 동일하게 표시됩니다.
  generate-citation-map.js가 자동 생성합니다.
  - [1] Author (2024). "Title". Source. URL
  - [2] ...

17. 큰 숫자 지표 (big-numbers):
  <!-- _class: big-numbers -->
  2~5개의 큰 숫자 지표를 균등 분할하여 배치합니다.
  div.metrics 안에 div.metric 요소를 나열합니다.
  각 div.metric 안에 div.number(큰 숫자)와 div.caption(설명)을 넣습니다.
  예시:
    <div class="metrics">
    <div class="metric">
    <div class="number">82%</div>
    <div class="caption">K8s Production<br>사용률</div>
    </div>
    <div class="metric">
    <div class="number">66%</div>
    <div class="caption">GenAI Inference를<br>K8s 위에서 운영</div>
    </div>
    </div>

18. 그림 한 장 (figure-center):
  <!-- _class: figure-center -->
  h2 제목 아래에 그림 하나를 가운데 배치합니다.
  그림 높이는 콘텐츠 영역 전체(--content-h)까지 늘어납니다.
  본문 불릿 없이 그림만 두는 슬라이드에 씁니다.

19. 그림 한 장 + 캡션 (figure-caption):
  <!-- _class: figure-caption -->
  그림 아래에 한두 줄 캡션을 답니다. 캡션은 이미지 다음 문단입니다.
  그림 높이는 콘텐츠 영역에서 캡션 자리(88px)를 뺀 만큼입니다.
  캡션 없이 그림만 둘 때는 figure-center 를 씁니다.

20. 그림 위 + 불릿 아래 (diagram-top):
  <!-- _class: diagram-top -->
  가로로 넓은 그림을 위에, 불릿을 아래에 둡니다.
  그림 높이는 콘텐츠 영역의 60%로 제한됩니다.
  그림이 넓고 낮은 형태(플로우, 타임라인)일 때 씁니다.

  figure-center 와 diagram-top 은 figure slot 클래스입니다.
  슬라이드 작성 단계에서 둘 중 하나를 고릅니다.
  이 선택이 그림 작성 시점의 크기 예산을 정합니다.
  vh 단위는 브라우저 창 기준이라 슬라이드 높이와 어긋납니다.
  그림 크기를 직접 제한할 때는 --content-h 를 쓰십시오.

21. 인용 한 줄 (quote):
  <!-- _class: quote -->
  blockquote 하나만 씁니다. 상자도 따옴표 글리프도 없이 흰 여백에 띄웁니다.
  마지막 문단이 두 개 이상이면 출처 줄로 보고 작고 옅게 깝니다.
  h2 없이 쓰면 상단 주황 바 없이 문장만 남습니다.

22. 두 열 + 결론 한 줄 (split-statement):
  <!-- _class: split-statement -->
  <div> 두 개가 위쪽 두 열, 그 뒤 blockquote 가 아래 전체 너비 결론 줄입니다.
  결론은 상자가 아니라 윗선 하나로 가르고 굵은 활자로 무게를 줍니다.
  좌우 비율은 <style scoped>section { --cols: 1fr 1.4fr; }</style>.

23. 배경 사진 위 흰 글자 (bg-dark):
  <!-- _class: title bg-dark -->  또는  <!-- _class: divider bg-dark -->
  전면 배경 사진은 Marp의 ![bg] 가 이미 해 주므로 레이아웃 클래스가 없습니다.
  bg-dark 는 글자만 흰색으로 돌립니다. 기본 본문색은 거의 검정이라 사진 위에서 사라집니다.
  사진을 어둡게 까는 건 Marp의 brightness 필터로 합니다. 0.4~0.5 사이가 무난합니다.
  작성 예:
    <!-- _class: title bg-dark -->

    ![bg brightness:0.45](images/figures/f00.jpg)

    # 제목

    ## 부제
  사진이 이미 어두우면 필터를 빼고 bg-dark 만 씁니다.
  가림막을 CSS로 깔지는 않습니다. marp-core 가 해당 section 에
  background: transparent 를 !important 로 박아 테마가 낄 자리가 없습니다.

24. 자동 축소 (auto-shrink):
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
