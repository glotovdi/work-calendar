import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { LoginRequestModel } from 'src/auth/models/login.request.model';
import { LoginResponseModel } from 'src/auth/models/login.response.model';
import { Config } from '../../config/config';
const ldap = require('ldapjs');
@Injectable()
export class LdapService implements OnApplicationShutdown {
  constructor(private configService: Config) {}
  config = {
    readerDn: this.configService.READER_DOMAIN_NAME,
    readerPwd: this.configService.READER_PASSWORD,
    serverUrl: this.configService.SERVER_URL,
    suffix: this.configService.SUFFIX
  };

  client: any;

  onApplicationShutdown() {
    this.client.destroy();
  }

  public async auth(credentials: LoginRequestModel, add?: boolean): Promise<LoginResponseModel> {
    this.client = ldap.createClient({
      url: this.config.serverUrl,
      reconnect: true
    });

    this.client.on('error', err => {
      console.log(err);
    });
    const filter = await this.getFilter(credentials.username);
    const user = await this.search(filter, credentials.password, add);
    const result = user[0];
    result.attributes = result.attributes.map(el => ({
      type: el.type,
      data: this.stringFromUTF8Array(el._vals[0])
    }));

    this.client.destroy();

    const data: LoginResponseModel = this.mapToSendOnClient(result.attributes);
    return data;
  }

  private mapToSendOnClient(attributes: { type: string; data: string }[]): LoginResponseModel {
    return {
      username: attributes.find(el => el.type === 'cn') ? attributes.find(el => el.type === 'cn').data : null,
      location: attributes.find(el => el.type === 'l') ? attributes.find(el => el.type === 'l').data : null,
      position: attributes.find(el => el.type === 'title') ? attributes.find(el => el.type === 'title').data : null,
      whenCreated: attributes.find(el => el.type === 'whenCreated')
        ? attributes.find(el => el.type === 'whenCreated').data
        : null,
      email: attributes.find(el => el.type === 'userPrincipalName')
        ? attributes.find(el => el.type === 'userPrincipalName').data
        : null,
      telNumber: attributes.find(el => el.type === 'mobile') ? attributes.find(el => el.type === 'mobile').data : null,
      physicalDeliveryOfficeName: attributes.find(el => el.type === 'physicalDeliveryOfficeName')
        ? attributes.find(el => el.type === 'physicalDeliveryOfficeName').data
        : null,
      mailNickname: attributes.find(el => el.type === 'mailNickname')
        ? attributes.find(el => el.type === 'mailNickname').data
        : null,
      projects: [],
      isAdmin: false,
      hasMailing: true,
      subdivision: null,
      jobPosition: attributes.find(el => el.type === 'title') ? attributes.find(el => el.type === 'title').data : null
    };
  }

  private getFilter(username: string): Promise<string> {
    const login = `${username}${this.configService.MAIL_PREFIX}`;
    return new Promise((resolve, reject) => {
      this.client.bind(this.config.readerDn, this.config.readerPwd, err => {
        if (err) {
          reject('Reader bind failed ' + err);
          return;
        }

        const filter = this.configService.LDAP_FILTER.replace(/@login@/g, login);

        resolve(filter);
      });
    });
  }

  private search(filter: string, password: string, add: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.search(
        this.config.suffix,
        {
          filter,
          scope: 'sub'
        },
        (err, searchRes) => {
          var searchList = [];

          searchRes.on('searchEntry', entry => {
            searchList.push(entry);
          });

          searchRes.on('error', entry => {
            console.log('error');
          });

          searchRes.on('end', retVal => {
            if (!searchList.length) {
              reject({ user: null });
            }

            for (let i = 0; i < searchList.length; i++)
              this.client.bind(searchList[0].objectName, password, err => {
                if (add && !err) {
                  resolve(searchList);
                }
                if (err || !password) {
                  reject({ user: null });
                } else {
                  resolve(searchList);
                }
              });
          });
        }
      );
    });
  }

  private stringFromUTF8Array(data) {
    const atributtes = [...data];
    const extraByteMap = [1, 1, 1, 1, 2, 2, 3, 0];
    var count = atributtes.length;
    var str = '';

    for (var index = 0; index < count; ) {
      var ch = data[index++];
      if (ch & 0x80) {
        var extra = extraByteMap[(ch >> 3) & 0x07];
        if (!(ch & 0x40) || !extra || index + extra > count) return null;

        ch = ch & (0x3f >> extra);
        for (; extra > 0; extra -= 1) {
          var chx = data[index++];
          if ((chx & 0xc0) != 0x80) return null;

          ch = (ch << 6) | (chx & 0x3f);
        }
      }

      str += String.fromCharCode(ch);
    }

    return str;
  }
}
