---
marp: true
theme: bai-flat
paginate: true
html: true
header: "행사이름"
# footer: 기관명 | 발표자
---

<!-- _class: title -->
<!-- _paginate: false -->

# 발표 제목

## 부제목 또는 발표 구분

발표자 | 소속 기관 | 2026년 00월

---

<!-- _class: toc -->

## 목차

### 본문

- 배경 및 동기 `3`
  - 개요
  - 관련 기술 동향
- 핵심 아이디어 `5`
  - AI 모델
  - 알고리즘
- 설계와 구현 `8`
  - 시스템 디자인
  - 구현 상세
- 결과 `15`
  - 성능 요약
  - 응용 사례
- 요약 `20`

### 참고자료

- 성능 측정 결과 `22`
- 테스트 방식 `26`
- 관련 논문 `30`

---

## 슬라이드 제목

- 핵심 포인트 1
  - 세부 내용 1-1
  - 세부 내용 1-2
- 핵심 포인트 2
- 핵심 포인트 3

> 인용 또는 강조할 내용을 이곳에 작성합니다.

---

<!-- _class: two-col -->

## 2단 분할 레이아웃

<div>

### 왼쪽 열

- 명시적 `<div>`로 좌우 열을 구분합니다
- 다른 클래스와 조합 가능
- 항목 A
- 항목 B

</div>

<div>

### 오른쪽 열

- 오른쪽 내용 1
- 오른쪽 내용 2

```
코드 블록도 배치 가능합니다
```

</div>

---

<!-- _class: swot -->

- <span class="strg">**강점**</span> fGPU 8년+ 상용 검증, 110개+ 기관 운영, GS 1등급·DGX-Ready 인증, 미국 특허 보유, 양 과제 주관
- <span class="wkns">**약점**</span> 글로벌 인지도 제한적 (해외 직접 고객 소수), 대규모(수천~수만 GPU) 클러스터 실증 이력 부족
- <span class="oppt">**기회**</span> GPUaaS CAGR 26.5%, 정부 GPU 26만 장 확보 추진, NVIDIA Run:ai 인수로 벤더 중립 대안 수요 급증
- <span class="thrt">**위협**</span> NVIDIA 칩~스케줄링 수직통합 완성, 글로벌 빅테크(Google, AWS) 자체 오케스트레이션 강화

<table>
  <tr>
    <th class="corner"></th>
    <th class="strg">강점 (Strengths)</th>
    <th class="wkns">약점 (Weaknesses)</th>
  </tr>
  <tr>
    <td class="oppt">기회<br>(Opportunities)</td>
    <td class="so"><strong>SO 전략</strong><ul>
      <li>핵심 강점 기반 시장 선점
      <li>기술 경쟁력 우위
    </ul></td>
    <td class="wo"><strong>WO 전략</strong><ul>
      <li>초기 시장 진입 비용
      <li>레퍼런스 부족
    </ul></td>
  </tr>
  <tr>
    <td class="thrt">위협<br>(Threats)</td>
    <td class="st"><strong>ST 전략</strong><ul>
      <li>기술력으로 후발 주자 견제
    </ul></td>
    <td class="wt"><strong>WT 전략</strong><ul>
      <li>대기업 시장 진입 위험
      <li>규제 환경 변화
    </ul></td>
  </tr>
</table>

---

<!-- _class: timeline -->

## 프로젝트 타임라인

- **1단계**<br>(2026)
  - 핵심 기술 개발
  - 프로토타입 구현
- **2단계**<br>(2027)
  - 기술 고도화
  - 파일럿 테스트
- **3단계**<br>(2028)
  - 사업화 준비
  - 성과 확산
- **완료**<br>(2029)
  - 목표 달성
  - 결과 보고

---

<style scoped>
section {
  .decoration-box:nth-of-type(1) { --accent-color: var(--cmap-magma-7); }
  .decoration-box:nth-of-type(2) { --accent-color: var(--cmap-magma-6); }
  .decoration-box:nth-of-type(3) { --accent-color: var(--cmap-magma-5); }
  .decoration-box:nth-of-type(4) { --accent-color: var(--cmap-magma-4); }
}
</style>

## 사업화 4대 전략

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
<div class="decoration-box check-list">

### Backend.AI Enterprise 통합

- ...
- ...
- ...

</div>
<div class="decoration-box check-list">

### 공동 실증·채널화

- ...
- ...
- ...

</div>
<div class="decoration-box check-list">

### AI 인프라 공급

- ...
- ...
- ...

</div>
<div class="decoration-box check-list">

### 오픈소스·글로벌 확장

- ...
- ...
- ...

</div>
</div>

---

<!-- _class: highlight-boxes -->

## 슬라이드 제목: 연구개발의 필요성

### 첫 번째 주제 — 배경 및 동향

- 핵심 포인트 1: 시장 규모 및 트렌드 설명
- 핵심 포인트 2: 기존 기술의 한계

### 두 번째 주제 — 기술적 필요성

- 핵심 포인트 3: 해결해야 할 문제
- 핵심 포인트 4: 본 연구의 접근 방향

### 세 번째 주제 — 기대 효과

- 핵심 포인트 5: 파급 효과 및 활용 방안

---

<!-- _class: numbered-dev-items side-by-side right-image -->
<style scoped>
section { --cols: 1fr 1fr; }
section h3::after { display: none; }
section h3:nth-of-type(1) { --key-color: var(--color-ep1); --number: "1"; }
section h3:nth-of-type(2) { --key-color: var(--color-ep2); --number: "2"; }
section h3:nth-of-type(3) { --key-color: var(--color-ep3); --number: "3"; }
</style>

## 핵심 연구내용 — 1단계: 핵심 기반 기술 확보 (2026~2027)

<div>

### 핵심개발항목1

- ...
- ...
- ...

### 핵심개발항목2

- ...
- ...
- ...

### 핵심개발항목3

- ...
- ...
- ...

</div>
<div class="image">
  <figure>
    <img src="images/placeholder.png">
    <figcaption>개발항목 관계도</figcaption>
  </figure>
</div>

---

<!-- _class: three-col -->

## 3단 분할 레이아웃

<div>

### 1단계 — 현황

- 기존 기술의 한계점 A
- 기존 기술의 한계점 B
- 시장 요구사항 분석

</div>

<div>

### 2단계 — 개발

- 핵심 기술 개발 항목 1
- 핵심 기술 개발 항목 2
- 프로토타입 검증

</div>

<div>

### 3단계 — 확산

- 실증 및 성능 검증
- 파일럿 적용
- 사업화 준비

</div>

---

<!-- _class: focus -->

## 핵심 강조 슬라이드 제목

> **워크로드 특성**에 따라 **가장 적합한 장치를 활용**하여
> 다양한 규모의 **다중 테넌트 워크로드**를
> 안전하고 효율적으로 실행할 수 있는 **핵심 기술 개발**

- 이종 장치 특성을 고려한 분할가상화 기반 기술
- 가상 인스턴스 동적할당·제어·모니터링 핵심 기능
- 가상 인스턴스 간 보안 격리 기술
- 가상 인스턴스 간 성능 격리 기술
- 실증 클러스터 구축·실험을 통한 성능·기능 검증

---

<!-- _class: end-product-list -->

## 연구개발 목표

1. **이종 장치 특성을 고려한 분할가상화 기반 기술 개발**<br>다중·이종 장치 특성 및 보안 계층 추상화, 단일 컴퓨팅 노드 내 스케줄링 알고리즘 개발
2. **가상 인스턴스 동적할당·제어·모니터링 핵심 기능 개발**<br>다중·이종 장치가 설치된 물리 연산 노드 통합 인식·관제
3. **가상 인스턴스 간 보안 격리 기술 개발**<br>클러스터 수준의 네트워크 가상화 관제를 통한 제어평면·데이터평면 격리
4. **가상 인스턴스 간 성능 격리 기술 개발**<br>워크로드 소속 가상 인스턴스 간 성능 격리, 체크포인트 기반 이종 장치 기반 워크로드 장애 자동 복구
5. **실증 클러스터 구축·실험을 통한 성능·기능 검증**<br>수요·수혜기관 협력을 통한 가상화 개발 및 테스트 환경 구축

---

<!-- _class: profile -->

## 참여기관 소개 — 연구책임자

![연구책임자 사진](images/profile-placeholder.png)

### 주요 경력

- 2020–현재: XX대학교 교수
- 2015–2020: XX연구원 선임연구원

### 주요 수상 실적

- 2023 Best Paper Award (학술대회명)
- 2021 우수 연구자상 (기관명)

### 주요 연구 성과

- 관련 분야 논문 20편 (SCIE 10편)
- 국내외 특허 8건

---

<!-- _class: four-box -->

## SWOT 취약점 대응 전략

- **기술 경쟁력 지속 강화**<br>오픈소스 머신러닝 통합 플랫폼의 기여 난이도 완화 및 구조 개선, 독자 핵심 기술 요소 및 특허 바탕으로 IP 확보 지속
- **시장 위협 회피를 위한 차별성**<br>하이브리드 클라우드 지원을 통한 특정 클라우드 서비스 사업자 비 종속 솔루션 제공
- **공동연구개발 체계를 통한 테스트베드 보완**<br>다수 이종 장치에 대응하여 개발 및 테스트를 위한 테스트베드 확보
- **협업 및 판로 체계 완비**<br>국내 클라우드 선도 업체인 KT Cloud, NHN Cloud와 직접 고객으로 확보, 글로벌 파트너십 구축

---

<!-- _class: appendix -->

## 평가 기준에 따른 요약 정리: 추진계획의 타당성

| 평가 항목 | 제안 내용 정리 | 제안서 참고 페이지 |
|----------|--------------|-----------------|
| 사전 준비 / 추진계획 구체성 | - 세계 최초 드라이버 레벨 기술 개발 및 한반입 절차 보유<br>- 국내외 시장 동향 및 특허현황 분석 선행 수행 | 18–23 |
| 연구개발 목표 명확성 | - 현재 및 미래의 이종 장치에 대한 오픈소스 기반의 운영할 수 있는 기술 계획 수립 | 24–35 |
| 추진체계의 적정성 | - 주관기관을 중심으로 공동연구개발기관 및 수요·수혜기관 간의 역할 분담 및 추진 체계 선후관계 제시 | 33–35 |

---

<!-- _class: gantt -->

## 개발 추진일정 (1~2차년도)

| 번호 | 개발내용 | 책임기관 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|-----|---------|---------|---|---|---|---|---|---|---|---|---|----|----|-----|
| 1 | 특성 추상화 모델 개발 | 주관 | ■ | ■ | ■ | ■ | | | | | | | | |
| 2 | 장치인식 프로토콜 개발 | 주관 | | | ■ | ■ | ■ | ■ | | | | | | |
| 3 | 가상화 기능 조사 | 공동 | ■ | ■ | ■ | | | | | | | | | |
| 4 | Baseline 성능 테스트 | 공동 | | | | ■ | ■ | ■ | ■ | | | | | |
| 5 | 수요·수혜기관 협력체계 구축 | 주관 | ■ | ■ | | | | | | | | | | |
| 공개 | 공개 산출물 | Backend.AI SW v25 (H1) | | | | | | ■ | | | | | | |

---

<!-- _class: side-by-side right-image -->

<style scoped>
section { --cols: 1.2fr 1fr; }
</style>

## 좌측 내용 + 우측 이미지

<div>

### 핵심 기술 개요

- 이종 장치 통합 관리 기술
- 실시간 모니터링 및 제어
- 자동화된 장애 복구

### 기대 효과

- 운영 효율성 30% 향상
- 장애 복구 시간 90% 단축

> 이미지는 오른쪽 열에 수직 중앙 정렬됩니다.

</div>
<div class="image">

![기술 아키텍처](images/profile-placeholder.png)

</div>

---

<!-- _class: side-by-side left-image -->

## 좌측 이미지 + 우측 내용

<div class="image">

![시스템 구성도](images/profile-placeholder.png)

</div>
<div>

### 시스템 구성

- 클러스터 관리 모듈
- 워크로드 스케줄러
- 보안 격리 레이어

### 주요 특징

- 멀티 테넌트 지원
- 이종 장치 자동 인식
- 플러그인 기반 확장 구조

</div>

---

<!-- _class: divider -->

# 감사합니다

## Q&A

<!-- vim: set sts=2 sw=2 -->
