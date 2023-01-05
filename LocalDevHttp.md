# LocalDevHttp

# 功能：

1、用于中转连接本地设备和前端，类似 NPAPI 插件，具体过程：前端通过 WebApi 与 LocalDevHttp 交互读取或写入设备数据，LocalDevHttp 收到 WebApi 参数读取或写入设备数据以最终实现前端与本地设备之间的交互。

# 适用系统：

XP、Win7 和 Win10 均支持

Visual studio 2015(VC140)中编译适用于 XP 环境的配置步骤：

1、工程属性->链接器->系统->子系统->控制台或窗口 windows（根据你的项目类型选择），第二项版本号设成 5.01

2、工程属性->常规->平台工具中添加 VS2015WindowsXP(v140_xp)

3、工程属性->链接->命令 中添加/SUBSYSTEM:WINDOWS,5.01，特别强调 5.01 不加引号；

# 依赖库：

1、mongoose 库（编入源码编译）

2、sdtapi 动态库(USB 部标)

3、wlsdtapi 动态库(USB HID + 串口 Rs232)

4、Inno Setup Compiler(安装包制作)

# 编译 IDE：

Visual studio 2015(vc140)

# 防占用端口集

默认端口:12321
备用端口 1:61234
备用端口 2:23456

# 文件结构：

│ LocalDevHttp.sln<br/>
│ LocalDevHttp_clean.bat<br/>
│ README.md<br/>
│ <br/>
├─app<br/>
│ wlsdtapi.dll(HID USB 动态库)<br/>
│ DTM_66VG_CardDll.dll<br/>
│ DLL_File.dll<br/>
│ <br/>
└─LocalDevHttp<br/>
│ │ LocalDevHttp.rc<br/>
│ │ LocalDevHttp.vcxproj<br/>
│ │ LocalDevHttp.vcxproj.filters<br/>
│ │ LocalDevHttp.vcxproj.user<br/>
│ │ main.cpp<br/>
│ │ resource.h<br/>
│ │ <br/>
│ ├─include<br/>
│ │ │ HttpServerHandler.h<br/>
│ │ │ IdCardInfo.h(功能：IDCard 信息解码)<br/>
│ │ │ LocalDevHttp.h(功能：建立 WebServer 提供 WebApi 服务)<br/>
│ │ │ mongoose.h(轻量型 Web 服务器)<br/>
│ │ │ <br/>
│ │ └─plog<br/>
│ │ │ Log.h<br/>
│ │ <br/>
│ ├─lib_DTM_66VG_CardDll<br/>
│ │ DTM_66VG_CardDll.lib<br/>
│ │ DTM_66VG_CardDll_API.h<br/>
│ │ <br/>
│ ├─lib_wlsdtapi<br/>
│ │ wlsdtapi.h<br/>
│ │ wlsdtapi.lib<br/>
│ │ <br/>
│ ├─res<br/>
│ │ Wellcom.ico<br/>
│ │ <br/>
│ └─src<br/>
│ HttpServerHandler.cpp<br/>
│ IdCardInfo.cpp<br/>
│ LocalDevHttp.cpp<br/>
│ mongoose.c<br/>

# DllApi 和 WebApi 对应关系

#### 读卡

**注意：** 读卡 HTTP**身份证基本信息**应答 HTTP 头为**"HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n"**<br/>
照片应答 HTTP 头为**"HTTP/1.1 200 OK\r\n" -- "Content-Type: application/x-bmp\r\n"**<br/>
指纹应答 HTTP 头为**"HTTP/1.1 200 OK\r\n" -- "Content-Type: text/plain\r\n"**<br/>
144 十六进制表示为 0x90

| WebApi                                        | DllApi                       | 成功返回                                                                               | 失败返回          |
| --------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------- | ----------------- |
| "/WlSdt_api/OpenPort?Port=1001"               | HID_OpenPort(Port=1001)      | {"return":144}                                                                         | {"return":错误码} |
| "/WlSdt_api/ClosePort?Port=1001"              | HID_ClosePort(Port=1001)     | {"return":144}                                                                         | {"return":错误码} |
| "/WlSdt_api/GetSAMID?Port=1001"               | HID_GetSAMStatus(Port=1001)  | 返回例如{"szSAMID"："1111","return":144}                                               | {"return":错误码} |
| "/WlSdt_api/GetCardNo?Port=1001"              | HID_GetCardNo(Port=1001)     | 返回例如{"cardNo"："1111","return":144}                                                | {"return":错误码} |
|                                               | HID_ReadBaseMsg(Port=1001)   | 当 ReadType=0 获取 Json 格式基本身份信息如{"Name":"张三","Sex"："男",...,"return":144} | {"return":错误码} |
| "/WlSdt_api/ReadBaseMsg?Port=1001&ReadType=1" | HID_ReadBaseMsg(Port=1001)   | 当 ReadType=1 获取身份证持有者照片并通过"photo.bmp"来传输                              | {"return":错误码} |
|                                               | HID_ReadBaseFPMsg(Port=1001) | 当 ReadType=2 获取指纹特征,已解析成字符串并通过"fingerPrint.txt"来传输                 | {"return":错误码} |

#### 制卡

**注意：** 制卡**HTTP 应答请求头**为**"HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n"**

| WebApi                                                   | DllApi                                           | 成功返回                             | 失败返回           |
| -------------------------------------------------------- | ------------------------------------------------ | ------------------------------------ | ------------------ |
| "/Dtm_Api/DtmCardGetDllVer"                              | DTM_CARD_GetDllVer()                             | 返回 { V1.0.0.1 build: Aug 31 2020 } |                    |
| "/Dtm_Api/DtmCardCommOpen?CardPort=111&DevicePort=111"   | DTM_CARD_CommOpen(CardPort=111,DevicePort=111)   | 返回 {"return": 0}                   | {"result": 错误码} |
| "/Dtm_Api/DtmCardCommClose"                              | DTM_CARD_CommClose                               | {"return": 0}                        | {"return": 错误码} |
| "/Dtm_Api/DtmCardCommandEx?Command=1&Data=abcd"          | DTM_CARD_CommCommandEx(Command=1,Data="abcd")    | {"return": 0}                        | {"return": 错误码} |
| "/Dtm_Api/DtmCardCommRead?StructType=31&Index=0&Count=1" | DTM_CARD_CommRead(StructType=31,Index=0,Count=1) | {"return": 0}                        | {"return": 错误码} |
| "/Dtm_Api/DtmCardCommWriteEx?Data=abcdef"                | DTM_CARD_CommWriteEx(Data=abcdef)                | {"return": 0}                        | {"return": 错误码} |
| "/Dtm_Api/DtmCardDataRead?StructType=31&Index=0&Count=1" | DTM_CARD_DataRead(StructType=31,Index=0,Count=1) | {"result": 0}                        | {"result": 错误码} |
| "/Dtm_Api/DtmCardCmdRead?StructType=31&Index=0&Count=1"  | DTM_CARD_DataRead(StructType=31,Index=0,Count=1) | {"return": 0}                        | {"return": 错误码} |
| "/Dtm_Api/DtmCardGetDataStrEx"                           | DTM_CARD_GetDataStrEx()                          | { "data": "DataStr","return":1}      | {"return": 1}      |

### 维尔 USBKEY

| WebApi                                                    | DllApi                                                | 成功返回                                    | 失败返回           |
| --------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------- | ------------------ |
| "/WlUsbKey_Api/GetReaderName"                             | USBKey_GetReaderName()                                | 返回{"return": 0}                           | 返回{"return": -1} |
| "/WlUsbKey_Api/GetSerialNum"                              | USBKey_Get_SerialNumber()                             | 返回{"SerialNum": 1234}                     | 返回{"return":-1}  |
| "/WlUsbKey_Api/FactoryInit"                               | USBKey_Factory_Init()                                 | 返回{"return": 0}                           | 返回{"return": -1} |
| "/WlUsbKey_Api/Format"                                    | USBKey_Format()                                       | 返回{"return": 0}                           | 返回{"return": -1} |
| "/WlUsbKey_Api/Erase?KL=1234"                             | USBKey_Erase(KL)                                      | 返回{"return": 0}                           | 返回{"return": -1} |
| "/WlUsbKey_Api/CheckPassword?PassWord=1234"               | USBKey_Check_PW(密码);                                | 返回{"return": 0}                           | 返回{"return": -1} |
| "/WlUsbKey_Api/ResetPassword?PassWord=1234"               | USBKey_Reset_PW(新密码)                               | 返回{"return": 0}                           | 返回{"return": -1} |
| "/WlUsbKey_Api/WriteCertPassword?CertPassWord=ABCD&len=4" | USBKey_Write_Certificate_Password(证书口令, 口令长度) | 返回{"return": 0}                           | 返回{"return": -1} |
| "/WlUsbKey_Api/ReadCertPassword"                          | USBKey_Read_Certificate_Password()                    | 返回{"CertPassWord": ABCD}                  | 返回{"return": -1} |
| "/WlUsbKey_Api/WriteCertificate?Certificate=ABCD&len=4"   | USBKey_Write_Certificate(证书, 证书长度)              | 返回{"return": 0}                           | 返回{"return": -1} |
| "/WlUsbKey_Api/ReadCertificate"                           | USBKey_Read_Certificate()                             | 返回{"Certificate": ABCD}                   | 返回{"return": -1} |
| "/WlUsbKey_Api/WriteSignature?Signature=ABCD&len=4"       | USBKey_WriteFile(签章, 签章长度)                      | 返回{"return": 0}                           | 返回{"return": -1} |
| "/WlUsbKey_Api/ReadSignature"                             | USBKey_ReadFile()                                     | 返回{"result": "date:image/jpg;base64,..."} | 返回{"return": -1} |
| "/WlUsbKey_Api/DOSIGN"                                    | USBKey_DOSIGN(加签内容, 内容长度, 密码);              | 返回{"result": 加签输出}                    | 返回{"return":-1}  |

\*\*注意：

1. 证书、证书口令和加签内容都需以 UTF-8/ANSI 多字节的编码传入数据，宽字节(Unicode)传入会出错;
2. 签章接收以 JPG 格式 Base64 编码的图片;

#### BUG 修复记录

1. localdevhttp 从 chrome 和 IE 浏览器上下载会被**windows defender**误报为**木马病毒**的问题，在安装了**360 杀毒软件**的 windows 系统上并未出现该情况，但下载后安装时会出现木马病毒的警告。<br/>
   **解决**：给安装包添加数字签名，最新数字签名从 2020 年 12 月 30 日开始生效。<br/>
2. 不支持 XP 系统<br/>
   **解决**：Visual Studio 平台工具集使用带 Windows XP 后缀版本的平台工具，相应地，依赖的动态库编译也需要用到带 Windows XP 后缀版本的平台工具。<br/>
