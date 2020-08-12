ffmpeg -r 30 -f image2 -s 500x500 -i "20200802212943-%06d.png" -vcodec libx264 -crf 17 -pix_fmt yuv420p 20200802212943.mp4

ffmpeg -r 30 -f image2 -s 500x500 -i "20200802213004-%06d.png" -vcodec libx264 -crf 17 -pix_fmt yuv420p 20200802213004.mp4

20200802213004-000033.png
20200802212817-000010.png
convert -delay 3.33 -loop 0 20200802213004*.png 20200802213004.gif

convert -delay 3.33 -loop 0 20200802212943*.png 20200802212943.gif
convert -delay 3.33 -loop 0 20200802212817*.png 20200802212817.gif

20200803155334.mp4

20200803155334-000[01]?0.png

20200803154056_20200803154056-0000?1.png

20200802212817-0000?[05].png

20200806225220-0000?9.png

find ./**/selection/ -name '*.png' | xargs cp ./selections

find ./**/selection/ -name '*.png' -type f -exec cp {} selections/

find . -iname "*.SomeExt" | xargs cp Destination_Directory/
