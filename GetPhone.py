import re
import requests


def get_phone():
    '''
    向红包服务端发送领取指令
    :return: 
    '''
    try:
        data = {
            'mobile': '13750011737',
            'url': 'https://h5.ele.me/hongbao/#hardware_id=&is_lucky_group=True&lucky_number=10&track_id=&platform=0&sn=10f2b5dc362b70ea&theme_id=2657&device_id=&refer_user_id=35271716'
        }
        r1=requests.post(url='http://127.0.0.1:3007/hongbao', data=data,timeout=3)
    except Exception as e:
        print(e)


def select_phone(text):
    '''
    将日志文件里的电话号码提取出来
    :param text: 日志文件内容
    :return: 
    '''
    file=open('phone.txt','a+')
    phone_list=[]
    phones = re.findall(r'\*.*?\d{11}', text,re.S)
    for phone in phones:
        phone=re.sub('\*{26}','',phone,re.S)
        phone_list.append(phone.strip())
    print('日志中读取电话号码:{}条'.format(len(phone_list)))
    phone_list=set(phone_list)
    for phone in phone_list:
        file.write(phone+',\n')
    file.close()
    print('不重复电话号码总:{}条'.format(len(phone_list)))
    print('写入完成!')




def make_random_phone():
    file=open('phone.txt')
    new_file=open('new_phone.txt','w+')
    phones=file.readlines()
    print('旧:电话号码数量:{}'.format(len(phones)))
    phone_list=set(phones)
    print('合并:电话号码数量:{}'.format(len(phone_list)))
    for items in phone_list:
        new_file.write(items)
    print('合并完成!')
    new_file.close()
    file.close()

if __name__ == '__main__':
    n=input(u'选择功能:  \n1.爬取验证电话号码,先打开红包服务端  \n2.从日志中导出电话号码  日志名为 phone.log 与脚本同一级目录 \n3.合并电话号码 导出文件为 new_phone.txt \n输入序号:')
    if n=='1':
        for i in range(10):  #发送10个请求去爬取验证电话号码
            get_phone()
    elif n=='2':
        file = open('phone.log')
        text = file.read()
        select_phone(text)  # 从日志中导出电话号码,并保存在phone.txt中
        file.close()
    elif n=='3':
        make_random_phone()

