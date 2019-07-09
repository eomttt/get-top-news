# -*- coding: utf-8 -*-
import sys
from gensim.summarization import summarize

# content = "(대구ㆍ경북=뉴스1) 남승렬 기자 = 19일 오후 8시2분쯤 대구시 동구 모아파트 옥상" + \
#         "에서 친구들과 놀던 고교생 A군(17)이 1층으로 떨어져 숨졌다." + \
#         "옥상에는 A군을 포함해 10대 3명이 있었다." + \
#         "친구 B·C군(17)은 경찰에서 '20층 아파트 옥상의 동과 동 사이에 설치된 비가람" + \
#         "아크릴 차광막 위를 건너뛰면서 놀다가 차광막이 깨지면서 A군이 1층으로 떨어졌다'고 말했다." + \
#         "검시 결과 A군은 추락으로 인한 다발상" + \
#         "손상사로 추정된다는 검안의 소견이 나왔다" + \
#         "경찰 관계자는 'A군 등이 옥상에서 놀던 중 반대편 지붕에서 차광막으로 몇 차" + \
#         "례 뛰다가 차광막이 파손돼 떨어진 것으로 추정된다'며" + \
#         "혹시 모를 다른 특이점이 있는 지 친구 등을 상대로 당시 상황을 면밀히 수사하고 있다'고 말했다."

content = sys.argv[1]
try:
    summarize_content = summarize(content, word_count=99)

    if len(summarize_content) > 0:
      print summarize_content
    else:
      try:
        summarize_content = summarize(content, ratio=0.3)
        if len(summarize_content) > 0:
          print summarize_content
        else:
          print content
      except:
        print content
except:
    # TOO SHORT CONTENT
    print content


